# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::GenerateEmbedding do
  let(:embedding) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:embedding_client) { instance_double(Autodidact::Provider::OpenaiEmbeddingClient) }

  before do
    allow(Autodidact::Provider).to receive(:embedding_client).and_return(embedding_client)
  end

  describe "#call" do
    it "returns the embedding vector on success" do
      allow(embedding_client).to receive(:embed).with(text: "hello world").and_return(embedding)

      result = described_class.call(text: "hello world")

      expect(result).to be_success
      expect(result.payload).to eq(embedding)
    end

    it "returns a failure result when the client raises ProviderError" do
      allow(embedding_client).to receive(:embed)
        .and_raise(Autodidact::Provider::ProviderError, "Embedding response was empty")

      result = described_class.call(text: "hello world")

      expect(result).to be_failure
      expect(result.error[:message]).to match(/Embedding response was empty/)
    end

    it "returns a failure result on Faraday connection errors" do
      allow(embedding_client).to receive(:embed).and_raise(Faraday::ConnectionFailed, "connection refused")

      expect(described_class.call(text: "hello world")).to be_failure
    end
  end
end
