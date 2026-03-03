# frozen_string_literal: true

require "spec_helper"
require "tmpdir"
require "yaml"

RSpec.describe Autodidact::Commands::SetupStatus do
  let(:notify) { proc {} }
  let(:config_dir) { Dir.mktmpdir }
  let(:model_catalog_payload) do
    {
      chat_provider_options: %w[openai anthropic],
      chat_provider_model_options: {
        "openai" => %w[gpt-4.1 gpt-4o-mini],
        "anthropic" => %w[claude-3-7-sonnet]
      },
      embedding_provider_options: %w[openai voyage],
      embedding_provider_model_options: {
        "openai" => %w[text-embedding-3-small],
        "voyage" => %w[voyage-3-large]
      }
    }
  end

  around do |example|
    ClimateControl.modify(XDG_CONFIG_HOME: config_dir) do
      Autodidact.reset_config!
      example.run
      Autodidact.reset_config!
    end
  end

  after { FileUtils.rm_rf(config_dir) }

  before do
    allow(Autodidact::Config::ModelCatalog).to receive(:call).and_return(success_result(model_catalog_payload))
  end

  describe "when config is complete" do
    before do
      config_path = File.join(config_dir, "autodidact")
      FileUtils.mkdir_p(config_path)

      File.write(File.join(config_path, "config.yml"), YAML.dump(
        "database_url" => "postgres://localhost/test",
        "obsidian_vault_path" => "/vault"
      ))
      File.write(File.join(config_path, "secrets.yml"), YAML.dump(
                                                          "token_openai" => "sk-test"
                                                        ))
    end

    it "returns ready status with no missing fields" do
      result = described_class.call(params: {}, notify: notify)

      expect(result.error).to be_nil
      expect(result.payload[:status]).to eq("ready")
      expect(result.payload[:missing_fields]).to be_empty
    end

    it "includes prefill data" do
      result = described_class.call(params: {}, notify: notify)

      expect(result.payload[:prefill][:database_url]).to eq("postgres://localhost/test")
      expect(result.payload[:prefill][:model]).to eq("gpt-4o-mini")
    end

    it "includes chat and embedding model options" do
      result = described_class.call(params: {}, notify: notify)

      expect(result.payload[:provider_options]).to contain_exactly("openai", "anthropic")
      expect(result.payload[:provider_model_options].keys).to contain_exactly("openai", "anthropic")
      expect(result.payload[:embedding_provider_options]).to contain_exactly("openai", "voyage")
      expect(result.payload[:embedding_provider_model_options].keys).to contain_exactly("openai", "voyage")
    end
  end

  describe "when config is incomplete" do
    it "returns needs_setup with missing fields" do
      result = described_class.call(params: {}, notify: notify)

      expect(result.error).to be_nil
      expect(result.payload[:status]).to eq("needs_setup")
      expect(result.payload[:missing_fields]).to include(:obsidian_vault_path, :access_token)
    end
  end
end
