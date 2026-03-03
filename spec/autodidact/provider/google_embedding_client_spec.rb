# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::GoogleEmbeddingClient do
  let(:embedding) { Array.new(1536) { rand } }
  let(:client) { described_class.new(access_token: "goog-test-key", model: "gemini-embedding-001") }
  let(:success_body) { JSON.dump(embedding: {values: embedding}) }
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
    it "returns the embedding vector on success" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, success_body] }

      result = client.embed(text: "hello world")

      expect(result).to eq(embedding)
    end

    it "sends output_dimensionality: 1536 in the request body" do
      captured_body = nil
      stubs.post("") do |env|
        captured_body = JSON.parse(env.body)
        [200, {"Content-Type" => "application/json"}, success_body]
      end

      client.embed(text: "hello world")

      expect(captured_body["output_dimensionality"]).to eq(1536)
    end

    it "raises ProviderError when Google returns a non-200 status" do
      stubs.post("") { [401, {}, "Unauthorized"] }

      expect do
        client.embed(text: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /Google embedding request failed: 401/)
    end

    it "raises ProviderError when the embedding values are missing" do
      stubs.post("") do
        [200, {"Content-Type" => "application/json"}, JSON.dump(embedding: {values: nil})]
      end

      expect do
        client.embed(text: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /Embedding response was empty/)
    end

    it "raises ProviderError when the embedding values are empty" do
      stubs.post("") do
        [200, {"Content-Type" => "application/json"}, JSON.dump(embedding: {values: []})]
      end

      expect do
        client.embed(text: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /Embedding response was empty/)
    end

    it "raises ProviderError on Faraday connection errors" do
      allow(faraday_connection).to receive(:post).and_raise(Faraday::ConnectionFailed, "connection refused")

      expect do
        client.embed(text: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /connection refused/)
    end

    it "raises ProviderError on malformed JSON response" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, "not json {{{"] }

      expect do
        client.embed(text: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /Failed to parse Google embedding response/)
    end
  end
end
