# frozen_string_literal: true

module Sources
  class ProcessSelection < ApplicationService
    Result = ApplicationResult.define(:error_message)

    STAGES = {
      convert: "CONVERT",
      persist: "PERSIST",
      chunk: "CHUNK",
      retrieve: "RETRIEVE",
      analyze: "ANALYZE",
      write: "WRITE"
    }.freeze

    def initialize(source_selection:)
      @source_selection = source_selection
    end

    def call
      transition_to_processing

      content = run_stage(:convert) { extract_content }
      return content if content.failure?

      chunks = run_stage(:chunk) { chunk_content(content.content) }
      return chunks if chunks.failure?

      embedded_chunks = run_stage(:chunk) { embed_chunks(chunks.chunks) }
      return embedded_chunks if embedded_chunks.failure?

      related_chunks = run_stage(:retrieve) { retrieve_related_chunks(embedded_chunks.chunks) }
      return related_chunks if related_chunks.failure?

      analysis = run_stage(:analyze) { analyze_content(embedded_chunks.chunks, related_chunks.chunks) }
      return analysis if analysis.failure?

      written = run_stage(:write) { write_results(analysis.analysis, embedded_chunks.chunks) }
      return written if written.failure?

      mark_complete
      refresh_source_status
      success(error_message: nil)
    end

    private

    attr_reader :source_selection

    def source
      source_selection.source
    end

    def transition_to_processing
      source_selection.update!(
        status: :processing,
        pipeline_stage: nil,
        error_message: nil,
        error_details: {}
      )
    end

    def run_stage(stage)
      source_selection.update!(pipeline_stage: STAGES.fetch(stage))
      result = yield

      return fail_processing(stage, result.error_message) if result.failure?

      result
    end

    def extract_content
      Sources::ExtractSelectionContent.call(source_selection: source_selection)
    end

    def chunk_content(content)
      Sources::ChunkContent.call(source_selection_content: content)
    end

    def embed_chunks(chunks)
      Sources::EmbedChunks.call(source_chunks: chunks)
    end

    def retrieve_related_chunks(chunks)
      Sources::RetrieveRelatedChunks.call(source_selection: source_selection, source_chunks: chunks)
    end

    def analyze_content(chunks, related_chunks)
      Sources::AnalyzeContent.call(source_chunks: chunks, related_chunks: related_chunks)
    end

    def write_results(analysis, chunks)
      Sources::WriteAnalysisResults.call(source_selection: source_selection, analysis: analysis, source_chunks: chunks)
    end

    def fail_processing(stage, message)
      mark_failed(stage, message)
      refresh_source_status
      failure(error_message: message)
    end

    def mark_complete
      source_selection.update!(status: :complete, pipeline_stage: nil, error_message: nil, error_details: {})
    end

    def mark_failed(stage, message)
      source_selection.update!(
        status: :failed,
        error_message: message,
        error_details: {
          stage: STAGES.fetch(stage),
          message: message
        }
      )
    end

    def refresh_source_status
      Sources::Lifecycle.call(source: source, event: :selection_statuses_changed)
    end
  end
end
