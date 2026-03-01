# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Analysis::GenerateNoteContent do
  let(:client) { instance_double(Autodidact::Provider::OpenaiClient) }
  let(:prompt) { "stubbed prompt content" }

  before do
    allow(Autodidact::Provider::ClientFor).to receive(:call).and_return(client)
    allow(Autodidact::Analysis::FixedPrompt).to receive(:call).with(raw_text: anything,
      related_chunks: anything).and_return(prompt)
  end

  describe "#call" do
    it "returns a success result with content from the provider" do
      allow(client).to receive(:chat).with(prompt: prompt).and_return("## Summary\n- note")

      result = described_class.call(raw_text: "hello world")

      expect(result).to be_success
      expect(result.payload).to eq("## Summary\n- note")
    end

    it "returns a failure result when the provider raises ProviderError" do
      allow(client).to receive(:chat)
        .and_raise(Autodidact::Provider::ProviderError, "rate limited")

      result = described_class.call(raw_text: "hello")

      expect(result).to be_failure
      expect(result.error[:message]).to include("rate limited")
    end

    it "returns a failure result when ClientFor raises UnknownProviderError" do
      allow(Autodidact::Provider::ClientFor).to receive(:call)
        .and_raise(Autodidact::Provider::ClientFor::UnknownProviderError, 'Unknown provider: "bogus"')

      result = described_class.call(raw_text: "hello")

      expect(result).to be_failure
      expect(result.error[:message]).to include("Unknown provider")
    end
  end
end
