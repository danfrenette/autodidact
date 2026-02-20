# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Config::Validator do
  let(:database_url) { "postgres://localhost/test" }
  let(:obsidian_vault_path) { "/vault" }
  let(:openai_access_token) { "sk-test" }
  let(:openai_model) { "gpt-4o-mini" }
  let(:provider) { "openai" }

  let(:config) do
    instance_double(
      Autodidact::Configuration,
      to_h: {
        database_url: database_url,
        obsidian_vault_path: obsidian_vault_path,
        openai_access_token: openai_access_token,
        openai_model: openai_model,
        provider: provider
      }
    )
  end

  describe ".call" do
    context "with openai provider (default)" do
      it "returns ready when vault path and access token are present" do
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
        let(:openai_access_token) { nil }

        it "returns not ready" do
          result = described_class.call(config: config)

          expect(result).not_to be_ready
          expect(result.missing_fields).to include(:openai_access_token)
        end
      end

      context "when both are missing" do
        let(:obsidian_vault_path) { nil }
        let(:openai_access_token) { nil }

        it "returns not ready with both fields listed" do
          result = described_class.call(config: config)

          expect(result).not_to be_ready
          expect(result.missing_fields).to contain_exactly(:obsidian_vault_path, :openai_access_token)
        end
      end
    end

    context "with dev provider" do
      let(:provider) { "dev" }
      let(:openai_access_token) { nil }

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

      it "ignores access token requirement" do
        result = described_class.call(config: config)

        expect(result.missing_fields).not_to include(:openai_access_token)
      end
    end

    context "with unknown provider" do
      let(:provider) { "unknown" }
      let(:obsidian_vault_path) { nil }
      let(:openai_access_token) { nil }

      it "returns ready (no required fields)" do
        result = described_class.call(config: config)

        expect(result).to be_ready
        expect(result.missing_fields).to be_empty
      end
    end

    context "with blank string values" do
      let(:obsidian_vault_path) { "   " }
      let(:openai_access_token) { "" }

      it "treats blank strings as missing" do
        result = described_class.call(config: config)

        expect(result).not_to be_ready
        expect(result.missing_fields).to contain_exactly(:obsidian_vault_path, :openai_access_token)
      end
    end

    context "when provider is nil (falls back to default)" do
      let(:provider) { nil }

      it "uses openai requirements" do
        result = described_class.call(config: config)

        expect(result).to be_ready
      end

      context "and access token is missing" do
        let(:openai_access_token) { nil }

        it "requires access token" do
          result = described_class.call(config: config)

          expect(result).not_to be_ready
          expect(result.missing_fields).to include(:openai_access_token)
        end
      end
    end
  end
end
