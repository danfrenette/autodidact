# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::ProcessSelection, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }
  let_it_be(:successful_processing_source, refind: true) { create(:source, :processing, user: current_user) }
  let_it_be(:failed_processing_source, refind: true) { create(:source, :processing, user: current_user) }

  describe ".call" do
    it "marks the selection complete when distillation succeeds" do
      selection = create(:source_selection, :processing, source: successful_processing_source)
      content = instance_double(SourceSelectionContent)
      chunks = [instance_double(SourceChunk)]
      related_chunks = [instance_double(SourceChunk)]
      analysis = {concepts: [], questions: [], quotes: []}
      allow_successful_pipeline(selection, content: content, chunks: chunks, related_chunks: related_chunks, analysis: analysis)

      result = described_class.call(source_selection: selection)

      expect(result).to be_success
      expect(selection.reload.status).to eq("complete")
      expect(selection.error_message).to be_nil
      expect(successful_processing_source.reload.status).to eq("complete")
    end

    it "returns failure, marks the selection failed, and refreshes source status when distillation fails" do
      selection = create(:source_selection, :processing, source: failed_processing_source)
      allow_failed_extraction("Distillation failed")

      result = described_class.call(source_selection: selection)

      expect(result).to be_failure
      expect(result.error_message).to eq("Distillation failed")
      expect(selection.reload.status).to eq("failed")
      expect(selection.error_message).to eq("Distillation failed")
      expect(selection.error_details).to include(
        "stage" => "CONVERT",
        "message" => "Distillation failed",
        "code" => "pipeline_error",
        "action" => "retry"
      )
      expect(failed_processing_source.reload.status).to eq("failed")
    end

    it "persists provider failure metadata from analysis failures" do
      selection = create(:source_selection, :processing, source: failed_processing_source)
      content = instance_double(SourceSelectionContent)
      chunks = [instance_double(SourceChunk)]
      allow_successful_pipeline_until_analysis(selection, content: content, chunks: chunks)

      result = described_class.call(source_selection: selection)

      expect(result).to be_failure
      expect(selection.reload).to be_failed
      expect(selection.error_message).to eq("Google quota exceeded.")
      expect(selection.error_details).to include(
        "stage" => "ANALYZE",
        "message" => "Google quota exceeded.",
        "code" => "quota_exceeded",
        "provider" => "google"
      )
    end

    it "persists unexpected pipeline errors on the selection" do
      selection = create(:source_selection, :processing, source: failed_processing_source)
      content = instance_double(SourceSelectionContent)
      chunks = [instance_double(SourceChunk)]
      related_chunks = [instance_double(SourceChunk)]
      analysis = {concepts: [], questions: [], quotes: []}
      allow_successful_pipeline(selection, content: content, chunks: chunks, related_chunks: related_chunks, analysis: analysis)
      allow(Sources::WriteAnalysisResults).to receive(:call).and_raise(JSON::ParserError, "unexpected token")

      result = described_class.call(source_selection: selection)

      expect(result).to be_failure
      expect(selection.reload).to be_failed
      expect(selection.error_message).to eq("Processing failed: unexpected token")
      expect(selection.error_details).to include(
        "stage" => "PROCESS",
        "message" => "Processing failed: unexpected token",
        "error_class" => "JSON::ParserError"
      )
      expect(failed_processing_source.reload.status).to eq("failed")
    end
  end

  def allow_successful_pipeline(selection, content:, chunks:, analysis:, related_chunks: [])
    allow(Sources::ExtractSelectionContent).to receive(:call)
      .with(source_selection: selection)
      .and_return(double(failure?: false, content: content))
    allow(Sources::ChunkContent).to receive(:call)
      .with(source_selection_content: content)
      .and_return(double(failure?: false, chunks: chunks))
    allow(Sources::EmbedChunks).to receive(:call)
      .with(source_chunks: chunks, user: selection.source.user)
      .and_return(double(failure?: false, chunks: chunks))
    allow(Sources::RetrieveRelatedChunks).to receive(:call)
      .with(source_selection: selection, source_chunks: chunks)
      .and_return(double(failure?: false, chunks: related_chunks))
    allow(Sources::AnalyzeContent).to receive(:call)
      .with(source_chunks: chunks, related_chunks: related_chunks, user: selection.source.user)
      .and_return(double(failure?: false, analysis: analysis))
    allow(Sources::WriteAnalysisResults).to receive(:call)
      .with(source_selection: selection, analysis: analysis, source_chunks: chunks + related_chunks)
      .and_return(double(failure?: false))
  end

  def allow_failed_extraction(message)
    allow(Sources::ExtractSelectionContent).to receive(:call)
      .and_return(double(failure?: true, error_message: message))
  end

  def allow_successful_pipeline_until_analysis(selection, content:, chunks:)
    allow(Sources::ExtractSelectionContent).to receive(:call)
      .with(source_selection: selection)
      .and_return(double(failure?: false, content: content))
    allow(Sources::ChunkContent).to receive(:call)
      .with(source_selection_content: content)
      .and_return(double(failure?: false, chunks: chunks))
    allow(Sources::EmbedChunks).to receive(:call)
      .with(source_chunks: chunks, user: selection.source.user)
      .and_return(double(failure?: false, chunks: chunks))
    allow(Sources::RetrieveRelatedChunks).to receive(:call)
      .with(source_selection: selection, source_chunks: chunks)
      .and_return(double(failure?: false, chunks: []))
    allow(Sources::AnalyzeContent).to receive(:call)
      .with(source_chunks: chunks, related_chunks: [], user: selection.source.user)
      .and_return(double(failure?: true, error_message: "Google quota exceeded.", error_details: {code: "quota_exceeded", provider: "google"}))
  end
end
