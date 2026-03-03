# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Config::ChatModelOptions do
  describe ".call" do
    it "returns openai chat models from allowed families" do
      allow(Autodidact::Config::ModelOptions).to receive(:call)
        .with(provider_id: "openai", families: %w[gpt gpt-pro])
        .and_return(%w[gpt-4.1 gpt-pro])

      result = described_class.call(provider_id: "openai")

      expect(result).to be_success
      expect(result.payload).to eq(%w[gpt-4.1 gpt-pro])
    end

    it "returns anthropic chat models from allowed families" do
      allow(Autodidact::Config::ModelOptions).to receive(:call)
        .with(provider_id: "anthropic", families: %w[claude-sonnet claude-haiku claude-opus])
        .and_return(%w[claude-3-7-sonnet claude-3-haiku])

      result = described_class.call(provider_id: "anthropic")

      expect(result).to be_success
      expect(result.payload).to eq(%w[claude-3-7-sonnet claude-3-haiku])
    end

    it "returns empty list for unsupported provider" do
      allow(Autodidact::Config::ModelOptions).to receive(:call)
        .with(provider_id: "unknown", families: [])
        .and_return([])

      result = described_class.call(provider_id: "unknown")

      expect(result).to be_success
      expect(result.payload).to eq([])
    end
  end
end
