# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Config::Validator do
  let(:obsidian_vault_path) { "/vault" }
  let(:access_token) { "sk-test" }
  let(:embedding_provider) { "openai" }
  let(:embedding_model) { "text-embedding-3-small" }
  let(:embedding_access_token) { "sk-test" }
  let(:provider) { "openai" }

  let(:config) do
    instance_double(
      Autodidact::Configuration,
      provider: provider,
      obsidian_vault_path: obsidian_vault_path,
      access_token: access_token,
      embedding_provider: embedding_provider,
      embedding_model: embedding_model,
      embedding_access_token: embedding_access_token
    )
  end

  describe ".call" do
    context "with openai provider (default)" do
      it "returns ready when all required fields are present" do
        result = described_class.call(config: config)

        expect(result).to be_ready
        expect(result.missing_fields).to be_empty
      end

      context "when vault path is missing" do
        let(:obsidian_vault_path) { nil }

        it "returns not ready" do
          result = described_class.call(config: config)

          expect(result).not_to be_ready
          expect(result.missing_fields).to include(:obsidian_vault_path)
        end
      end

      context "when access token is missing" do
        let(:access_token) { nil }

        it "returns not ready" do
          result = described_class.call(config: config)

          expect(result).not_to be_ready
          expect(result.missing_fields).to include(:access_token)
        end
      end

      context "when embedding fields are missing" do
        let(:embedding_provider) { nil }
        let(:embedding_model) { nil }
        let(:embedding_access_token) { nil }

        it "returns not ready with all embedding fields listed" do
          result = described_class.call(config: config)

          expect(result).not_to be_ready
          expect(result.missing_fields).to include(:embedding_provider, :embedding_model, :embedding_access_token)
        end
      end

      context "when all required fields are missing" do
        let(:obsidian_vault_path) { nil }
        let(:access_token) { nil }
        let(:embedding_provider) { nil }
        let(:embedding_model) { nil }
        let(:embedding_access_token) { nil }

        it "returns not ready with all fields listed" do
          result = described_class.call(config: config)

          expect(result).not_to be_ready
          expect(result.missing_fields).to contain_exactly(
            :obsidian_vault_path, :access_token,
            :embedding_provider, :embedding_model, :embedding_access_token
          )
        end
      end
    end

    context "with dev provider" do
      let(:provider) { "dev" }
      let(:access_token) { nil }
      let(:embedding_access_token) { nil }

      it "returns ready when only vault path is present" do
        result = described_class.call(config: config)

        expect(result).to be_ready
        expect(result.missing_fields).to be_empty
      end

      context "when vault path is missing" do
        let(:obsidian_vault_path) { nil }

        it "returns not ready" do
          result = described_class.call(config: config)

          expect(result).not_to be_ready
          expect(result.missing_fields).to contain_exactly(:obsidian_vault_path)
        end
      end

      it "ignores token and embedding requirements" do
        result = described_class.call(config: config)

        expect(result.missing_fields).not_to include(
          :access_token, :embedding_provider, :embedding_model, :embedding_access_token
        )
      end
    end

    context "with blank string values" do
      let(:obsidian_vault_path) { "   " }
      let(:access_token) { "" }
      let(:embedding_access_token) { "" }

      it "treats blank strings as missing" do
        result = described_class.call(config: config)

        expect(result).not_to be_ready
        expect(result.missing_fields).to include(:obsidian_vault_path, :access_token, :embedding_access_token)
      end
    end
  end
end
