# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::WriteAnalysisResults, type: :service do
  describe ".call" do
    it "writes generated records and citations" do
      selection = create(:source_selection)
      content = create(:source_selection_content, source_selection: selection)
      chunk = create(:source_chunk, source_selection_content: content, chunk_id: "chunk-1")
      analysis = {
        concepts: [
          {
            name: "Transactions",
            definition: "A unit of work.",
            classification: "core",
            why_it_matters: "It keeps state consistent.",
            cited_chunk_ids: ["chunk-1"]
          }
        ],
        questions: [
          {
            tier: 1,
            tier_name: "Recall",
            text: "What is a transaction?",
            answer: "A unit of work.",
            cited_chunk_ids: ["chunk-1"]
          }
        ],
        quotes: [
          {
            text: "A transaction is a unit of work.",
            note: "Definition",
            cited_chunk_ids: ["chunk-1"]
          }
        ]
      }

      result = described_class.call(source_selection: selection, analysis: analysis, source_chunks: [chunk])

      expect(result).to be_success
      expect(selection.concepts.pluck(:name)).to eq(["Transactions"])
      expect(selection.questions.pluck(:text)).to eq(["What is a transaction?"])
      expect(selection.quotes.pluck(:text)).to eq(["A transaction is a unit of work."])
      expect(Citation.count).to eq(3)
    end

    it "replaces existing generated records" do
      selection = create(:source_selection)
      content = create(:source_selection_content, source_selection: selection)
      chunk = create(:source_chunk, source_selection_content: content, chunk_id: "chunk-1")
      create(:concept, source_selection: selection, name: "Old Concept")

      result = described_class.call(
        source_selection: selection,
        source_chunks: [chunk],
        analysis: {
          concepts: [{name: "New Concept", cited_chunk_ids: ["chunk-1"]}],
          questions: [],
          quotes: []
        }
      )

      expect(result).to be_success
      expect(selection.concepts.pluck(:name)).to eq(["New Concept"])
    end

    it "defaults unexpected concept classifications to supporting" do
      selection = create(:source_selection)
      content = create(:source_selection_content, source_selection: selection)
      chunk = create(:source_chunk, source_selection_content: content, chunk_id: "chunk-1")

      result = described_class.call(
        source_selection: selection,
        source_chunks: [chunk],
        analysis: {
          concepts: [
            {
              name: "Assertive Programming",
              classification: "Programming Philosophy",
              cited_chunk_ids: ["chunk-1"]
            }
          ],
          questions: [],
          quotes: []
        }
      )

      expect(result).to be_success
      expect(selection.concepts.sole.classification).to eq("supporting")
    end

    it "resolves generated citation ids that are unique chunk id prefixes" do
      selection = create(:source_selection)
      content = create(:source_selection_content, source_selection: selection)
      chunk = create(:source_chunk, source_selection_content: content, chunk_id: "5e8e16a3cb53db46e6fc6bf948aac6e115c4b8e5c9d42f02319cd63a98db78e5")

      result = described_class.call(
        source_selection: selection,
        source_chunks: [chunk],
        analysis: {
          concepts: [
            {
              name: "Individual Contribution in Engineering",
              cited_chunk_ids: ["5e8e16a3cb53db46e6fc6bf948aac6e115c4b8e5"]
            }
          ],
          questions: [],
          quotes: []
        }
      )

      expect(result).to be_success
      expect(selection.concepts.sole.citations.sole.source_chunk).to eq(chunk)
    end
  end
end
