# frozen_string_literal: true

require "spec_helper"
require "tmpdir"
require "yaml"

RSpec.describe Autodidact::Commands::UpdateConfig do
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

  it "persists config and separates tokens by provider" do
    described_class.call(
      database_url: "postgres://localhost/test",
      obsidian_vault_path: "/vault",
      tokens: {"openai" => "sk-test"}
    )

    config_data = YAML.safe_load_file(File.join(config_path, "config.yml"))
    secrets_data = YAML.safe_load_file(File.join(config_path, "secrets.yml"))

    expect(config_data["database_url"]).to eq("postgres://localhost/test")
    expect(config_data["obsidian_vault_path"]).to eq("/vault")
    expect(secrets_data["token_openai"]).to eq("sk-test")
  end

  it "returns ready when saved config is complete" do
    result = described_class.call(
      database_url: "postgres://localhost/test",
      obsidian_vault_path: "/vault",
      provider: "openai",
      model: "gpt-4o-mini",
      embedding_provider: "openai",
      embedding_model: "text-embedding-3-small",
      tokens: {"openai" => "sk-test"}
    )

    expect(result.payload[:status]).to eq("ready")
    expect(result.payload[:missing_fields]).to be_empty
    expect(result.payload[:provider]).to eq("openai")
    expect(result.payload[:model]).to eq("gpt-4o-mini")
  end

  it "returns needs_setup when saved config is incomplete" do
    result = described_class.call(database_url: "postgres://localhost/test")

    expect(result.payload[:status]).to eq("needs_setup")
    expect(result.payload[:missing_fields]).to include(:obsidian_vault_path, :access_token)
  end

  it "preserves existing tokens when updating other fields" do
    FileUtils.mkdir_p(config_path)
    File.write(
      File.join(config_path, "secrets.yml"),
      YAML.dump("token_anthropic" => "sk-anthropic")
    )

    described_class.call(tokens: {"openai" => "sk-openai"})

    secrets_data = YAML.safe_load_file(File.join(config_path, "secrets.yml"))
    expect(secrets_data["token_openai"]).to eq("sk-openai")
    expect(secrets_data["token_anthropic"]).to eq("sk-anthropic")
  end
end
