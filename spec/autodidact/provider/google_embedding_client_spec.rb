# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::GoogleEmbeddingClient do
  let(:embedding_a) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:embedding_b) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:client) { described_class.new(access_token: "goog-test-key", model: "gemini-embedding-001") }
  let(:stubs) { Faraday::Adapter::Test::Stubs.new }
  let(:faraday_connection) do
    Faraday.new do |conn|
      conn.adapter :test, stubs
    end
  end

  before do
    allow(Faraday).to receive(:new).and_return(faraday_connection)
  end

  describe "#embed" do
    let(:success_body) { JSON.dump(embedding: {values: embedding_a}) }

    it "returns the embedding vector" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, success_body] }

      expect(client.embed(text: "hello world")).to eq(embedding_a)
    end

    it "sends output_dimensionality in the request body" do
      captured_body = nil
      stubs.post("") do |env|
        captured_body = JSON.parse(env.body)
        [200, {"Content-Type" => "application/json"}, success_body]
      end

      client.embed(text: "hello world")

      expect(captured_body["output_dimensionality"]).to eq(Autodidact::Provider::EMBEDDING_DIMENSIONS)
    end

    it "raises ProviderError on non-200 status" do
      stubs.post("") { [401, {}, "Unauthorized"] }

      expect { client.embed(text: "test") }
        .to raise_error(Autodidact::Provider::ProviderError, /Google embedding request failed: 401/)
    end

    it "raises ProviderError when embedding values are missing" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, JSON.dump(embedding: {values: nil})] }

      expect { client.embed(text: "test") }
        .to raise_error(Autodidact::Provider::ProviderError, /Embedding response was empty/)
    end

    it "raises ProviderError on Faraday connection errors" do
      allow(faraday_connection).to receive(:post).and_raise(Faraday::ConnectionFailed, "connection refused")

      expect { client.embed(text: "test") }
        .to raise_error(Autodidact::Provider::ProviderError, /connection refused/)
    end

    it "raises ProviderError on malformed JSON" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, "not json {{{"] }

      expect { client.embed(text: "test") }
        .to raise_error(Autodidact::Provider::ProviderError, /Failed to parse Google embedding response/)
    end
  end

  describe "#embed_batch" do
    let(:success_body) do
      JSON.dump(embeddings: [{"values" => embedding_a}, {"values" => embedding_b}])
    end

    it "returns embeddings in request order" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, success_body] }

      expect(client.embed_batch(texts: %w[first second])).to eq([embedding_a, embedding_b])
    end

    it "sends output_dimensionality and models/ prefix in each sub-request" do
      captured_body = nil
      stubs.post("") do |env|
        captured_body = JSON.parse(env.body)
        [200, {"Content-Type" => "application/json"}, success_body]
      end

      client.embed_batch(texts: %w[first second])

      captured_body["requests"].each do |req|
        expect(req["output_dimensionality"]).to eq(Autodidact::Provider::EMBEDDING_DIMENSIONS)
        expect(req["model"]).to eq("models/gemini-embedding-001")
      end
    end

    it "raises ProviderError on non-200 status" do
      stubs.post("") { [400, {}, "Bad Request"] }

      expect { client.embed_batch(texts: ["test"]) }
        .to raise_error(Autodidact::Provider::ProviderError, /Google batch embedding failed: 400/)
    end

    it "raises ProviderError when embeddings are missing" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, JSON.dump(embeddings: nil)] }

      expect { client.embed_batch(texts: ["test"]) }
        .to raise_error(Autodidact::Provider::ProviderError, /Batch embedding response was empty/)
    end

    it "raises ProviderError on Faraday connection errors" do
      allow(faraday_connection).to receive(:post).and_raise(Faraday::ConnectionFailed, "connection refused")

      expect { client.embed_batch(texts: ["test"]) }
        .to raise_error(Autodidact::Provider::ProviderError, /connection refused/)
    end

    it "raises ProviderError on malformed JSON" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, "not json {{{"] }

      expect { client.embed_batch(texts: ["test"]) }
        .to raise_error(Autodidact::Provider::ProviderError, /Failed to parse Google embedding response/)
    end
  end
end
