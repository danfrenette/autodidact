# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Chunking::TextChunker do
  describe ".call" do
    it "returns an empty array for nil input" do
      result = described_class.call(raw_text: nil)

      expect(result).to be_success
      expect(result.payload).to eq([])
    end

    it "returns an empty array for blank input" do
      result = described_class.call(raw_text: "   ")

      expect(result).to be_success
      expect(result.payload).to eq([])
    end

    it "returns TextChunk objects with sequential indices" do
      text = "A sentence about one topic. " * 200
      result = described_class.call(raw_text: text)

      expect(result).to be_success
      expect(result.payload.length).to be > 1

      result.payload.each_with_index do |chunk, idx|
        expect(chunk).to be_a(Autodidact::TextChunk)
        expect(chunk.chunk_index).to eq(idx)
        expect(chunk.content).not_to be_empty
      end
    end

    it "returns a single chunk for short text" do
      result = described_class.call(raw_text: "Hello, world!")

      expect(result).to be_success
      expect(result.payload.length).to eq(1)
      expect(result.payload.first.content).to eq("Hello, world!")
      expect(result.payload.first.chunk_index).to eq(0)
    end
  end
end
