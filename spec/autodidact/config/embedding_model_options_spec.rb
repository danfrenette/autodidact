# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Config::EmbeddingModelOptions do
  describe ".call" do
    it "returns openai embedding models from text-embedding family" do
      allow(Autodidact::Config::ModelOptions).to receive(:call)
        .with(provider_id: "openai", families: ["text-embedding"])
        .and_return(%w[text-embedding-3-small text-embedding-3-large])

      result = described_class.call(provider_id: "openai")

      expect(result).to be_success
      expect(result.payload).to eq(%w[text-embedding-3-small text-embedding-3-large])
    end

    it "returns voyage models from voyage family" do
      allow(Autodidact::Config::ModelOptions).to receive(:call)
        .with(provider_id: "voyage", families: ["voyage"])
        .and_return(%w[voyage-3-large voyage-3-lite])

      result = described_class.call(provider_id: "voyage")

      expect(result).to be_success
      expect(result.payload).to eq(%w[voyage-3-large voyage-3-lite])
    end
  end
end
