# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Analysis::GenerateNoteContent do
  let(:client) { instance_double("OpenAI::Client") }

  before do
    allow(OpenAI::Client).to receive(:new).and_return(client)
    allow(Autodidact.config).to receive(:openai_access_token).and_return("test-token")
    allow(Autodidact.config).to receive(:openai_model).and_return("gpt-4o-mini")
  end

  describe "#call" do
    it "returns assistant content from OpenAI response" do
      allow(client).to receive(:chat).and_return(
        "choices" => [{"message" => {"content" => "## Summary\n- note"}}]
      )

      result = described_class.call(raw_text: "hello world")

      expect(result).to eq("## Summary\n- note")
      expect(client).to have_received(:chat)
    end

    it "raises when OpenAI returns empty content" do
      allow(client).to receive(:chat).and_return(
        "choices" => [{"message" => {"content" => ""}}]
      )

      expect do
        described_class.call(raw_text: "hello")
      end.to raise_error(StandardError, /OpenAI analysis failed: OpenAI returned empty content/)
    end

    it "wraps client errors with context" do
      allow(client).to receive(:chat).and_raise(StandardError, "rate limited")

      expect do
        described_class.call(raw_text: "hello")
      end.to raise_error(StandardError, /OpenAI analysis failed: rate limited/)
    end
  end
end
