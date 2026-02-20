# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::OpenaiClient do
  let(:client) { described_class.new(access_token: "sk-test", model: "gpt-4o-mini") }
  let(:openai_client) { instance_double(OpenAI::Client) }

  before do
    allow(OpenAI::Client).to receive(:new).with(access_token: "sk-test").and_return(openai_client)
  end

  describe "#chat" do
    it "returns assistant content from OpenAI response" do
      allow(openai_client).to receive(:chat).and_return(
        "choices" => [{"message" => {"content" => "## Summary\n- note"}}]
      )

      result = client.chat(prompt: "test prompt")

      expect(result).to eq("## Summary\n- note")
    end

    it "raises when OpenAI returns empty content" do
      allow(openai_client).to receive(:chat).and_return(
        "choices" => [{"message" => {"content" => ""}}]
      )

      expect do
        client.chat(prompt: "test")
      end.to raise_error(StandardError, /Provider returned empty content/)
    end

    it "raises when OpenAI returns nil content" do
      allow(openai_client).to receive(:chat).and_return(
        "choices" => [{"message" => {"content" => nil}}]
      )

      expect do
        client.chat(prompt: "test")
      end.to raise_error(StandardError, /Provider returned empty content/)
    end

    it "wraps client errors" do
      allow(openai_client).to receive(:chat).and_raise(StandardError, "rate limited")

      expect do
        client.chat(prompt: "test")
      end.to raise_error(StandardError, /rate limited/)
    end
  end
end
