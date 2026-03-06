# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Analysis::ContextBudget do
  def chunk(token_count:)
    Autodidact::RetrievedChunk.new(
      content: "x" * token_count,
      chunk_index: 0,
      source_path: "/test.pdf",
      token_count: token_count
    )
  end

  describe ".call" do
    it "returns all chunks when they fit within budget" do
      chunks = [chunk(token_count: 100), chunk(token_count: 200)]

      result = described_class.call(
        provider: "openai",
        model: "gpt-4o",
        source_text_tokens: 1000,
        related_chunks: chunks
      )

      expect(result).to be_success
      expect(result.payload).to eq(chunks)
    end

    it "trims chunks that exceed the budget" do
      small = chunk(token_count: 100)
      large = chunk(token_count: 500_000)

      result = described_class.call(
        provider: "openai",
        model: "gpt-4o",
        source_text_tokens: 100_000,
        related_chunks: [small, large]
      )

      expect(result).to be_success
      expect(result.payload).to eq([small])
    end

    it "returns an empty array when the source text fills the budget" do
      result = described_class.call(
        provider: "openai",
        model: "gpt-4o",
        source_text_tokens: 200_000,
        related_chunks: [chunk(token_count: 100)]
      )

      expect(result).to be_success
      expect(result.payload).to be_empty
    end

    it "uses a larger budget for google models" do
      big_chunk = chunk(token_count: 200_000)

      openai_result = described_class.call(
        provider: "openai",
        model: "gpt-4o",
        source_text_tokens: 0,
        related_chunks: [big_chunk]
      )

      google_result = described_class.call(
        provider: "google",
        model: "gemini-2.5-flash",
        source_text_tokens: 0,
        related_chunks: [big_chunk]
      )

      expect(openai_result.payload).to be_empty
      expect(google_result.payload).to eq([big_chunk])
    end

    it "falls back to default limit for unknown providers" do
      result = described_class.call(
        provider: "unknown",
        model: "mystery-model",
        source_text_tokens: 1000,
        related_chunks: [chunk(token_count: 100)]
      )

      expect(result).to be_success
      expect(result.payload.size).to eq(1)
    end

    it "preserves chunk ordering from input" do
      first = chunk(token_count: 100)
      second = chunk(token_count: 200)
      third = chunk(token_count: 300)

      result = described_class.call(
        provider: "anthropic",
        model: "claude-sonnet-4-20250514",
        source_text_tokens: 1000,
        related_chunks: [first, second, third]
      )

      expect(result.payload).to eq([first, second, third])
    end
  end
end
