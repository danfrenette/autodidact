# frozen_string_literal: true

require "spec_helper"
require "tmpdir"
require "yaml"

RSpec.describe Autodidact::Commands::UpdateConfig do
  let(:notify) { proc {} }
  let(:config_dir) { Dir.mktmpdir }
  let(:config_path) { File.join(config_dir, "autodidact") }

  around do |example|
    ClimateControl.modify(XDG_CONFIG_HOME: config_dir) do
      Autodidact.reset_config!
      example.run
      Autodidact.reset_config!
    end
  end

  after { FileUtils.rm_rf(config_dir) }

  it "persists config and secrets to separate files" do
    params = {
      database_url: "postgres://localhost/test",
      obsidian_vault_path: "/vault",
      openai_access_token: "sk-test"
    }

    described_class.call(params: params, notify: notify)

    config_data = YAML.safe_load_file(File.join(config_path, "config.yml"))
    secrets_data = YAML.safe_load_file(File.join(config_path, "secrets.yml"))

    expect(config_data["database_url"]).to eq("postgres://localhost/test")
    expect(config_data["obsidian_vault_path"]).to eq("/vault")
    expect(secrets_data["openai_access_token"]).to eq("sk-test")
  end

  it "returns ready when saved config is complete" do
    params = {
      database_url: "postgres://localhost/test",
      obsidian_vault_path: "/vault",
      openai_access_token: "sk-test"
    }

    result = described_class.call(params: params, notify: notify)

    expect(result.payload[:status]).to eq("ready")
    expect(result.payload[:missing_fields]).to be_empty
  end

  it "returns needs_setup when saved config is incomplete" do
    result = described_class.call(params: {database_url: "postgres://localhost/test"}, notify: notify)

    expect(result.payload[:status]).to eq("needs_setup")
    expect(result.payload[:missing_fields]).to include(:obsidian_vault_path, :openai_access_token)
  end
end
