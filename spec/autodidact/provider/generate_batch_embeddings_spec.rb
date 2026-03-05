# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::GenerateBatchEmbeddings do
  let(:embedding_a) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:embedding_b) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:embedding_client) { instance_double(Autodidact::Provider::OpenaiEmbeddingClient) }

  before do
    allow(Autodidact::Provider).to receive(:embedding_client).and_return(embedding_client)
  end

  describe "#call" do
    it "returns an empty array without hitting the client when given no texts" do
      result = described_class.call(texts: [])

      expect(result).to be_success
      expect(result.payload).to eq([])
    end

    it "returns embeddings in input order" do
      allow(embedding_client).to receive(:embed_batch)
        .with(texts: %w[first second])
        .and_return([embedding_a, embedding_b])

      result = described_class.call(texts: %w[first second])

      expect(result).to be_success
      expect(result.payload).to eq([embedding_a, embedding_b])
    end

    it "returns a failure result when the client raises ProviderError" do
      allow(embedding_client).to receive(:embed_batch)
        .and_raise(Autodidact::Provider::ProviderError, "Batch embedding response was empty")

      result = described_class.call(texts: ["test"])

      expect(result).to be_failure
      expect(result.error[:message]).to match(/Batch embedding response was empty/)
    end

    it "returns a failure result on Faraday connection errors" do
      allow(embedding_client).to receive(:embed_batch)
        .and_raise(Faraday::ConnectionFailed, "connection refused")

      expect(described_class.call(texts: ["test"])).to be_failure
    end
  end
end
