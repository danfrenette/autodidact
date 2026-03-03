# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::GoogleClient do
  let(:client) { described_class.new(access_token: "goog-test-key", model: "gemini-2.0-flash") }
  let(:success_body) do
    JSON.dump(
      candidates: [{content: {parts: [{text: "## Summary\n- note"}]}}]
    )
  end
  let(:stubs) { Faraday::Adapter::Test::Stubs.new }
  let(:faraday_connection) do
    Faraday.new do |conn|
      conn.adapter :test, stubs
    end
  end

  before do
    allow(Faraday).to receive(:new).and_return(faraday_connection)
  end

  describe "#chat" do
    it "returns text content from a successful response" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, success_body] }

      result = client.chat(prompt: "test prompt")

      expect(result).to eq("## Summary\n- note")
    end

    it "raises ProviderError when Google returns a non-200 status" do
      stubs.post("") { [401, {}, "Unauthorized"] }

      expect do
        client.chat(prompt: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /Google request failed: 401/)
    end

    it "raises ProviderError when content is empty" do
      stubs.post("") do
        [200, {"Content-Type" => "application/json"},
          JSON.dump(candidates: [{content: {parts: [{text: ""}]}}])]
      end

      expect do
        client.chat(prompt: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /Provider returned empty content/)
    end

    it "raises ProviderError when content is nil" do
      stubs.post("") do
        [200, {"Content-Type" => "application/json"},
          JSON.dump(candidates: [{content: {parts: [{text: nil}]}}])]
      end

      expect do
        client.chat(prompt: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /Provider returned empty content/)
    end

    it "raises ProviderError on Faraday connection errors" do
      allow(faraday_connection).to receive(:post).and_raise(Faraday::ConnectionFailed, "connection refused")

      expect do
        client.chat(prompt: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /connection refused/)
    end

    it "raises ProviderError on malformed JSON response" do
      stubs.post("") { [200, {"Content-Type" => "application/json"}, "not json {{{"] }

      expect do
        client.chat(prompt: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /Failed to parse Google response/)
    end
  end
end
