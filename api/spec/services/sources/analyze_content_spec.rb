# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::AnalyzeContent, type: :service do
  describe ".call" do
    it "returns analysis from the configured generation client" do
      chunk = create(:source_chunk)
      analysis = {concepts: [], questions: [], quotes: []}
      client = double(analyze: analysis)

      result = described_class.call(source_chunks: [chunk], related_chunks: [], client: client)

      expect(result).to be_success
      expect(result.analysis).to eq(analysis)
      expect(client).to have_received(:analyze).with(source_chunks: [chunk], related_chunks: [])
    end
  end
end
