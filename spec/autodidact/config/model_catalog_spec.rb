# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Config::ModelCatalog do
  describe ".call" do
    it "returns chat and embedding provider model maps" do
      allow(Autodidact::Config::ChatModelOptions).to receive(:call)
        .with(provider_id: "openai")
        .and_return(success_result(%w[gpt-4.1]))
      allow(Autodidact::Config::ChatModelOptions).to receive(:call)
        .with(provider_id: "anthropic")
        .and_return(success_result(%w[claude-3-7-sonnet]))

      allow(Autodidact::Config::EmbeddingModelOptions).to receive(:call)
        .with(provider_id: "openai")
        .and_return(success_result(%w[text-embedding-3-small]))
      allow(Autodidact::Config::EmbeddingModelOptions).to receive(:call)
        .with(provider_id: "voyage")
        .and_return(success_result(%w[voyage-3-large]))

      result = described_class.call

      expect(result).to be_success
      expect(result.payload).to eq(
        chat_provider_options: %w[openai anthropic],
        chat_provider_model_options: {
          "openai" => %w[gpt-4.1],
          "anthropic" => %w[claude-3-7-sonnet]
        },
        embedding_provider_options: %w[openai voyage],
        embedding_provider_model_options: {
          "openai" => %w[text-embedding-3-small],
          "voyage" => %w[voyage-3-large]
        }
      )
    end

    it "returns failure when a model options query fails" do
      allow(Autodidact::Config::ChatModelOptions).to receive(:call)
        .with(provider_id: "openai")
        .and_return(error_result("boom"))

      result = described_class.call

      expect(result).to be_failure
      expect(result.error[:message]).to eq("boom")
    end
  end
end
