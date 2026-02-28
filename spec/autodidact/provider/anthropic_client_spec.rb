# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::AnthropicClient do
  let(:client) { described_class.new(access_token: "sk-ant-test", model: "claude-sonnet-4-5-20250929") }
  let(:anthropic_client) { instance_double(Anthropic::Client) }
  let(:messages_resource) { instance_double(Anthropic::Resources::Messages) }

  before do
    allow(Anthropic::Client).to receive(:new).with(api_key: "sk-ant-test").and_return(anthropic_client)
    allow(anthropic_client).to receive(:messages).and_return(messages_resource)
  end

  describe "#chat" do
    it "returns text content from the Anthropic response" do
      text_block = Anthropic::TextBlock.new(type: :text, text: "## Summary\n- note")
      message = instance_double(Anthropic::Message, content: [text_block])

      allow(messages_resource).to receive(:create).and_return(message)

      result = client.chat(prompt: "test prompt")

      expect(result).to eq("## Summary\n- note")
    end

    it "passes the correct parameters to the API" do
      text_block = Anthropic::TextBlock.new(type: :text, text: "response")
      message = instance_double(Anthropic::Message, content: [text_block])

      allow(messages_resource).to receive(:create).and_return(message)

      client.chat(prompt: "test prompt")

      expect(messages_resource).to have_received(:create).with(
        max_tokens: 4096,
        messages: [{role: "user", content: "test prompt"}],
        model: "claude-sonnet-4-5-20250929"
      )
    end

    it "raises ProviderError when the API returns empty content" do
      text_block = Anthropic::TextBlock.new(type: :text, text: "")
      message = instance_double(Anthropic::Message, content: [text_block])

      allow(messages_resource).to receive(:create).and_return(message)

      expect do
        client.chat(prompt: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /Provider returned empty content/)
    end

    it "raises ProviderError when the API returns no text blocks" do
      message = instance_double(Anthropic::Message, content: [])

      allow(messages_resource).to receive(:create).and_return(message)

      expect do
        client.chat(prompt: "test")
      end.to raise_error(Autodidact::Provider::ProviderError, /Provider returned empty content/)
    end

    it "wraps API errors in ProviderError" do
      allow(messages_resource).to receive(:create)
        .and_raise(Anthropic::Errors::RateLimitError.new(
          url: nil, status: 429, headers: {}, body: nil, request: nil, response: nil,
          message: "rate limited"
        ))

      expect do
        client.chat(prompt: "test")
      end.to raise_error(Autodidact::Provider::ProviderError)
    end
  end
end
