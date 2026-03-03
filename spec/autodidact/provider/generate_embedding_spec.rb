# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::GenerateEmbedding do
  let(:embedding) { Array.new(1536) { rand } }
  let(:openai_client) { instance_double(Autodidact::Provider::OpenaiEmbeddingClient) }
  let(:config) do
    instance_double(
      Autodidact::Configuration,
      embedding_provider: "openai",
      embedding_model: "text-embedding-3-small",
      embedding_access_token: "sk-test"
    )
  end

  before do
    allow(Autodidact).to receive(:config).and_return(config)
    allow(Autodidact::Provider::OpenaiEmbeddingClient).to receive(:new)
      .with(access_token: "sk-test", model: "text-embedding-3-small")
      .and_return(openai_client)
  end

  describe "#call" do
    it "returns the embedding vector on success" do
      allow(openai_client).to receive(:embed).with(text: "hello world").and_return(embedding)

      result = described_class.call(text: "hello world")

      expect(result).to be_success
      expect(result.payload).to eq(embedding)
    end

    it "returns a failure result when the client raises ProviderError" do
      allow(openai_client).to receive(:embed).and_raise(
        Autodidact::Provider::ProviderError, "Embedding response was empty"
      )

      result = described_class.call(text: "hello world")

      expect(result).to be_failure
      expect(result.error[:message]).to match(/Embedding response was empty/)
    end

    it "returns a failure result on Faraday connection errors" do
      allow(openai_client).to receive(:embed).and_raise(Faraday::ConnectionFailed, "connection refused")

      result = described_class.call(text: "hello world")

      expect(result).to be_failure
    end

    context "with voyage embedding provider" do
      let(:voyage_client) { instance_double(Autodidact::Provider::VoyageClient) }
      let(:config) do
        instance_double(
          Autodidact::Configuration,
          embedding_provider: "voyage",
          embedding_model: "voyage-3-large",
          embedding_access_token: "pa-voyage"
        )
      end

      before do
        allow(Autodidact::Provider::VoyageClient).to receive(:new)
          .with(access_token: "pa-voyage", model: "voyage-3-large")
          .and_return(voyage_client)
      end

      it "uses the voyage client" do
        allow(voyage_client).to receive(:embed).with(text: "hello world").and_return(embedding)

        result = described_class.call(text: "hello world")

        expect(result).to be_success
        expect(result.payload).to eq(embedding)
      end
    end
  end
end
