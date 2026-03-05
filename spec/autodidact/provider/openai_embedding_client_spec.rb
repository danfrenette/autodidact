# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::OpenaiEmbeddingClient do
  let(:embedding_a) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:embedding_b) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:openai_client) { instance_double(OpenAI::Client) }
  let(:client) { described_class.new(access_token: "sk-test", model: "text-embedding-3-small") }

  before do
    allow(OpenAI::Client).to receive(:new).and_return(openai_client)
  end

  describe "#embed" do
    it "returns the embedding vector" do
      allow(openai_client).to receive(:embeddings).and_return(
        "data" => [{"embedding" => embedding_a, "index" => 0}]
      )

      expect(client.embed(text: "hello world")).to eq(embedding_a)
    end

    it "raises ProviderError when data is missing" do
      allow(openai_client).to receive(:embeddings).and_return("data" => nil)

      expect { client.embed(text: "test") }
        .to raise_error(Autodidact::Provider::ProviderError, /Embedding response was empty/)
    end
  end

  describe "#embed_batch" do
    it "returns embeddings sorted by index" do
      allow(openai_client).to receive(:embeddings).and_return(
        "data" => [
          {"embedding" => embedding_b, "index" => 1},
          {"embedding" => embedding_a, "index" => 0}
        ]
      )

      expect(client.embed_batch(texts: %w[first second])).to eq([embedding_a, embedding_b])
    end

    it "raises ProviderError when data is missing" do
      allow(openai_client).to receive(:embeddings).and_return("data" => nil)

      expect { client.embed_batch(texts: ["test"]) }
        .to raise_error(Autodidact::Provider::ProviderError, /Embedding response was empty/)
    end

    it "raises ProviderError on Faraday errors" do
      allow(openai_client).to receive(:embeddings)
        .and_raise(Faraday::ConnectionFailed, "connection refused")

      expect { client.embed_batch(texts: ["test"]) }
        .to raise_error(Autodidact::Provider::ProviderError, /connection refused/)
    end
  end
end
