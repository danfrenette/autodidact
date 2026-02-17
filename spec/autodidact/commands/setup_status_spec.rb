# frozen_string_literal: true

require "spec_helper"
require "tmpdir"
require "yaml"

RSpec.describe Autodidact::Commands::SetupStatus do
  let(:notify) { proc {} }
  let(:config_dir) { Dir.mktmpdir }

  around do |example|
    ClimateControl.modify(XDG_CONFIG_HOME: config_dir) do
      Autodidact.reset_config!
      example.run
      Autodidact.reset_config!
    end
  end

  after { FileUtils.rm_rf(config_dir) }

  describe "when config is complete" do
    before do
      config_path = File.join(config_dir, "autodidact")
      FileUtils.mkdir_p(config_path)

      File.write(File.join(config_path, "config.yml"), YAML.dump(
        "database_url" => "postgres://localhost/test",
        "obsidian_vault_path" => "/vault"
      ))
      File.write(File.join(config_path, "secrets.yml"), YAML.dump(
                                                          "openai_access_token" => "sk-test"
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
      expect(result.payload[:prefill][:openai_model]).to eq("gpt-4o-mini")
    end
  end

  describe "when config is incomplete" do
    it "returns needs_setup with missing fields" do
      result = described_class.call(params: {}, notify: notify)

      expect(result.error).to be_nil
      expect(result.payload[:status]).to eq("needs_setup")
      expect(result.payload[:missing_fields]).to contain_exactly(
        :obsidian_vault_path, :openai_access_token
      )
    end
  end
end
