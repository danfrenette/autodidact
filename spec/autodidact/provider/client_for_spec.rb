# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::ClientFor do
  let(:config) do
    instance_double(
      Autodidact::Configuration,
      provider: provider,
      access_token: "sk-test",
      model: "gpt-4o-mini"
    )
  end

  describe ".call" do
    context "when provider is 'openai'" do
      let(:provider) { "openai" }

      it "returns an OpenaiClient instance" do
        result = described_class.call(config: config)

        expect(result).to be_a(Autodidact::Provider::OpenaiClient)
      end
    end

    context "when provider is 'anthropic'" do
      let(:provider) { "anthropic" }

      it "returns an AnthropicClient instance" do
        result = described_class.call(config: config)

        expect(result).to be_a(Autodidact::Provider::AnthropicClient)
      end
    end

    context "when provider is 'google'" do
      let(:provider) { "google" }

      it "returns a GoogleClient instance" do
        result = described_class.call(config: config)

        expect(result).to be_a(Autodidact::Provider::GoogleClient)
      end
    end

    context "when provider is 'dev'" do
      let(:provider) { "dev" }

      it "returns a DevClient instance" do
        result = described_class.call(config: config)

        expect(result).to be_a(Autodidact::Provider::DevClient)
      end
    end

    context "when provider is unknown" do
      let(:provider) { "unknown" }

      it "raises UnknownProviderError" do
        expect do
          described_class.call(config: config)
        end.to raise_error(
          described_class::UnknownProviderError,
          /Unknown provider: "unknown"/
        )
      end

      it "raises a subclass of ProviderError" do
        expect do
          described_class.call(config: config)
        end.to raise_error(Autodidact::Provider::ProviderError)
      end
    end
  end
end
