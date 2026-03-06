# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Analysis::FixedPrompt do
  let(:raw_text) { "The source material to study." }

  describe ".call" do
    context "without related chunks" do
      it "does not include a Related Material section" do
        prompt = described_class.call(raw_text: raw_text)

        expect(prompt).not_to include("Related Material")
      end

      it "includes the source text" do
        prompt = described_class.call(raw_text: raw_text)

        expect(prompt).to include(raw_text)
      end
    end

    context "with related chunks" do
      let(:chunk_a) do
        Autodidact::RetrievedChunk.new(
          content: "Chunk A from book one.",
          chunk_index: 0,
          source_path: "/books/ruby.pdf",
          token_count: 6
        )
      end

      let(:chunk_b) do
        Autodidact::RetrievedChunk.new(
          content: "Chunk B from book one.",
          chunk_index: 1,
          source_path: "/books/ruby.pdf",
          token_count: 6
        )
      end

      let(:chunk_c) do
        Autodidact::RetrievedChunk.new(
          content: "Chunk C from another book.",
          chunk_index: 0,
          source_path: "/books/testing.pdf",
          token_count: 6
        )
      end

      it "includes the Related Material header" do
        prompt = described_class.call(raw_text: raw_text, related_chunks: [chunk_a])

        expect(prompt).to include("## Related Material")
      end

      it "includes the Tier 4 instruction" do
        prompt = described_class.call(raw_text: raw_text, related_chunks: [chunk_a])

        expect(prompt).to include("Tier 4")
      end

      it "groups chunks under their source_path as a heading" do
        prompt = described_class.call(raw_text: raw_text, related_chunks: [chunk_a, chunk_c])

        expect(prompt).to include("### /books/ruby.pdf")
        expect(prompt).to include("### /books/testing.pdf")
      end

      it "includes chunk content" do
        prompt = described_class.call(raw_text: raw_text, related_chunks: [chunk_a, chunk_b])

        expect(prompt).to include("Chunk A from book one.")
        expect(prompt).to include("Chunk B from book one.")
      end

      it "places Related Material before Source text" do
        prompt = described_class.call(raw_text: raw_text, related_chunks: [chunk_a])

        expect(prompt.index("Related Material")).to be < prompt.index("Source text:")
      end

      it "still includes the source text after the related material" do
        prompt = described_class.call(raw_text: raw_text, related_chunks: [chunk_a])

        expect(prompt).to include(raw_text)
      end
    end
  end
end
