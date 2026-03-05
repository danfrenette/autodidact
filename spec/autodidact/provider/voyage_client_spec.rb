# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::VoyageClient do
  let(:embedding_a) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:embedding_b) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:client) { described_class.new(access_token: "pa-test", model: "voyage-3-large") }
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
    it "returns the first embedding vector" do
      stubs.post("") do
        [200, {"Content-Type" => "application/json"},
          JSON.dump(data: [{"embedding" => embedding_a, "index" => 0}])]
      end

      expect(client.embed(text: "hello")).to eq(embedding_a)
    end

    it "raises ProviderError on non-200 status" do
      stubs.post("") { [401, {}, "Unauthorized"] }

      expect { client.embed(text: "hello") }
        .to raise_error(Autodidact::Provider::ProviderError, /Voyage request failed: 401/)
    end

    it "raises ProviderError on Faraday connection errors" do
      allow(faraday_connection).to receive(:post).and_raise(Faraday::ConnectionFailed, "connection refused")

      expect { client.embed(text: "hello") }
        .to raise_error(Autodidact::Provider::ProviderError, /connection refused/)
    end
  end

  describe "#embed_batch" do
    it "returns embeddings sorted by index" do
      stubs.post("") do
        [200, {"Content-Type" => "application/json"},
          JSON.dump(data: [
            {"embedding" => embedding_b, "index" => 1},
            {"embedding" => embedding_a, "index" => 0}
          ])]
      end

      expect(client.embed_batch(texts: %w[first second])).to eq([embedding_a, embedding_b])
    end

    it "raises ProviderError when data is missing" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, JSON.dump(data: nil)] }

      expect { client.embed_batch(texts: ["test"]) }
        .to raise_error(Autodidact::Provider::ProviderError, /Batch embedding response was empty/)
    end

    it "raises ProviderError on non-200 status" do
      stubs.post("") { [429, {}, "Too Many Requests"] }

      expect { client.embed_batch(texts: ["test"]) }
        .to raise_error(Autodidact::Provider::ProviderError, /Voyage request failed: 429/)
    end

    it "raises ProviderError on Faraday connection errors" do
      allow(faraday_connection).to receive(:post).and_raise(Faraday::ConnectionFailed, "connection refused")

      expect { client.embed_batch(texts: ["test"]) }
        .to raise_error(Autodidact::Provider::ProviderError, /connection refused/)
    end
  end
end
