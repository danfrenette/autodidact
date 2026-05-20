# frozen_string_literal: true

require "rails_helper"

RSpec.describe Analysis::SourceSelectionPrompt do
  it "includes current and related chunks" do
    source_chunk = instance_double(SourceChunk, chunk_id: "current-1", content: "Current chunk text")
    related_chunk = instance_double(SourceChunk, chunk_id: "related-1", content: "Related chunk text")

    prompt = described_class.new(source_chunks: [source_chunk], related_chunks: [related_chunk]).to_s

    expect(prompt).to include("Return only valid JSON")
    expect(prompt).to include("Use only the chunk labels shown below")
    expect(prompt).to include("- C1: Current chunk text")
    expect(prompt).to include("- R1: Related chunk text")
    expect(prompt).not_to include("current-1")
    expect(prompt).not_to include("related-1")
  end

  it "resolves prompt-local citation labels to persisted chunk ids" do
    source_chunk = instance_double(SourceChunk, chunk_id: "current-1", content: "Current chunk text")
    related_chunk = instance_double(SourceChunk, chunk_id: "related-1", content: "Related chunk text")
    prompt = described_class.new(source_chunks: [source_chunk], related_chunks: [related_chunk])

    analysis = prompt.resolve_citations(
      concepts: [{name: "Concept", cited_chunk_ids: %w[C1 R1]}],
      questions: [{text: "Question", cited_chunk_ids: ["C1"]}],
      quotes: [{text: "Quote", cited_chunk_ids: ["R1"]}]
    )

    expect(analysis.dig(:concepts, 0, :cited_chunk_ids)).to eq(%w[current-1 related-1])
    expect(analysis.dig(:questions, 0, :cited_chunk_ids)).to eq(["current-1"])
    expect(analysis.dig(:quotes, 0, :cited_chunk_ids)).to eq(["related-1"])
  end
end
