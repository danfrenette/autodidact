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
      analysis = {concepts: [], questions: [], quotes: []}
      allow_successful_pipeline(selection, content: content, chunks: chunks, analysis: analysis)

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
      expect(selection.error_details).to eq("stage" => "CONVERT", "message" => "Distillation failed")
      expect(failed_processing_source.reload.status).to eq("failed")
    end
  end

  def allow_successful_pipeline(selection, content:, chunks:, analysis:)
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
      .and_return(double(failure?: false, analysis: analysis))
    allow(Sources::WriteAnalysisResults).to receive(:call)
      .with(source_selection: selection, analysis: analysis, source_chunks: chunks)
      .and_return(double(failure?: false))
  end

  def allow_failed_extraction(message)
    allow(Sources::ExtractSelectionContent).to receive(:call)
      .and_return(double(failure?: true, error_message: message))
  end
end
