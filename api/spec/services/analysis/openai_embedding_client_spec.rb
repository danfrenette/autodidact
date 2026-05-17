# frozen_string_literal: true

require "rails_helper"

RSpec.describe Analysis::OpenaiEmbeddingClient do
  let(:openai_client) { instance_double(OpenAI::Client) }
  let(:embedding_a) { Array.new(1536, 0.1) }
  let(:embedding_b) { Array.new(1536, 0.2) }

  before do
    allow(OpenAI::Client).to receive(:new).with(access_token: "sk-test").and_return(openai_client)
  end

  it "returns a single embedding" do
    allow(openai_client).to receive(:embeddings)
      .with(parameters: {model: "text-embedding-3-small", input: "hello"})
      .and_return("data" => [{"embedding" => embedding_a, "index" => 0}])

    client = described_class.new(api_key: "sk-test", model: "text-embedding-3-small")

    expect(client.embed("hello")).to eq(embedding_a)
  end

  it "returns batch embeddings in input order" do
    allow(openai_client).to receive(:embeddings)
      .with(parameters: {model: "text-embedding-3-small", input: %w[first second]})
      .and_return(
        "data" => [
          {"embedding" => embedding_b, "index" => 1},
          {"embedding" => embedding_a, "index" => 0}
        ]
      )

    client = described_class.new(api_key: "sk-test", model: "text-embedding-3-small")

    expect(client.embed_batch(%w[first second])).to eq([embedding_a, embedding_b])
  end

  it "raises a provider error when the response is empty" do
    allow(openai_client).to receive(:embeddings).and_return("data" => [])

    client = described_class.new(api_key: "sk-test", model: "text-embedding-3-small")

    expect { client.embed("hello") }.to raise_error(Analysis::ProviderError, "Embedding response was empty")
  end
end
