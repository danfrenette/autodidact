# frozen_string_literal: true

require "rails_helper"

RSpec.describe Analysis::SourceSelectionPrompt do
  it "includes current and related chunks" do
    source_chunk = instance_double(SourceChunk, chunk_id: "current-1", content: "Current chunk text")
    related_chunk = instance_double(SourceChunk, chunk_id: "related-1", content: "Related chunk text")

    prompt = described_class.new(source_chunks: [source_chunk], related_chunks: [related_chunk]).to_s

    expect(prompt).to include("Return only valid JSON")
    expect(prompt).to include("- current-1: Current chunk text")
    expect(prompt).to include("- related-1: Related chunk text")
  end
end
