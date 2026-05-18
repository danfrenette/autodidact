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

      content = extract_content
      return failed_result if failed?

      chunks = chunk_content(content)
      return failed_result if failed?

      embedded_chunks = embed_chunks(chunks)
      return failed_result if failed?

      related_chunks = retrieve_related_chunks(embedded_chunks)
      return failed_result if failed?

      analysis = analyze_content(embedded_chunks, related_chunks)
      return failed_result if failed?

      write_results(analysis, embedded_chunks)
      return failed_result if failed?

      mark_complete
      refresh_source_status
      success(error_message: nil)
    end

    private

    attr_reader :source_selection, :failed_result

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

    def extract_content
      transition_to_stage(:convert)
      result = Sources::ExtractSelectionContent.call(source_selection: source_selection)

      fail_processing(:convert, result.error_message) if result.failure?

      result.content unless failed?
    end

    def chunk_content(content)
      transition_to_stage(:chunk)
      result = Sources::ChunkContent.call(source_selection_content: content)

      fail_processing(:chunk, result.error_message) if result.failure?

      result.chunks unless failed?
    end

    def embed_chunks(chunks)
      transition_to_stage(:chunk)
      result = Sources::EmbedChunks.call(source_chunks: chunks, user: source.user)

      fail_processing(:chunk, result.error_message, result.error_details) if result.failure?

      result.chunks unless failed?
    end

    def retrieve_related_chunks(chunks)
      transition_to_stage(:retrieve)
      result = Sources::RetrieveRelatedChunks.call(source_selection: source_selection, source_chunks: chunks)

      fail_processing(:retrieve, result.error_message) if result.failure?

      result.chunks unless failed?
    end

    def analyze_content(chunks, related_chunks)
      transition_to_stage(:analyze)
      result = Sources::AnalyzeContent.call(source_chunks: chunks, related_chunks: related_chunks, user: source.user)

      fail_processing(:analyze, result.error_message, result.error_details) if result.failure?

      result.analysis unless failed?
    end

    def write_results(analysis, chunks)
      transition_to_stage(:write)
      result = Sources::WriteAnalysisResults.call(source_selection: source_selection, analysis: analysis, source_chunks: chunks)

      fail_processing(:write, result.error_message) if result.failure?
    end

    def transition_to_stage(stage)
      source_selection.update!(pipeline_stage: STAGES.fetch(stage))
    end

    def fail_processing(stage, message, details = {})
      mark_failed(stage, message, details)
      refresh_source_status
      @failed_result = failure(error_message: message)
    end

    def failed?
      failed_result.present?
    end

    def mark_complete
      source_selection.update!(status: :complete, pipeline_stage: nil, error_message: nil, error_details: {})
    end

    def mark_failed(stage, message, details = {})
      source_selection.update!(
        status: :failed,
        error_message: message,
        error_details: {
          stage: STAGES.fetch(stage),
          message: message
        }.merge(details.stringify_keys)
      )
    end

    def refresh_source_status
      Sources::Lifecycle.call(source: source, event: :selection_statuses_changed)
    end
  end
end
