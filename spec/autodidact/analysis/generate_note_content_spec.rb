# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Analysis::GenerateNoteContent do
  let(:client) { instance_double(Autodidact::Provider::OpenaiClient) }
  let(:prompt) { "stubbed prompt content" }

  before do
    allow(Autodidact::Provider::ClientFor).to receive(:call).and_return(client)
    allow(Autodidact::Analysis::FixedPrompt).to receive(:call).and_return(prompt)
  end

  describe "#call" do
    it "returns content from provider chat" do
      allow(client).to receive(:chat).with(prompt: prompt).and_return("## Summary\n- note")

      result = described_class.call(raw_text: "hello world")

      expect(result).to eq("## Summary\n- note")
    end

    it "wraps provider errors with context" do
      allow(client).to receive(:chat).and_raise(StandardError, "rate limited")

      expect do
        described_class.call(raw_text: "hello")
      end.to raise_error(described_class::ProviderError, /Provider analysis failed: rate limited/)
    end
  end
end
