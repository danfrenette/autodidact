# frozen_string_literal: true

require "spec_helper"
require "tmpdir"

RSpec.describe Autodidact::Config::Store do
  around do |example|
    Dir.mktmpdir do |dir|
      ClimateControl.modify(XDG_CONFIG_HOME: dir) do
        example.run
      end
    end
  end

  describe ".write_config / .read_config" do
    it "round-trips config data through YAML" do
      described_class.write_config(database_url: "postgres://localhost/test")

      expect(described_class.read_config).to eq(database_url: "postgres://localhost/test")
    end

    it "creates the config directory if missing" do
      config_dir = Autodidact::Config::Path.config_dir
      expect(config_dir).not_to exist

      described_class.write_config(database_url: "postgres://localhost/test")

      expect(config_dir).to exist
    end
  end

  describe ".write_secrets / .read_secrets" do
    it "round-trips secrets data through YAML" do
      described_class.write_secrets(openai_access_token: "sk-test")

      expect(described_class.read_secrets).to eq(openai_access_token: "sk-test")
    end

    it "sets 0600 permissions on secrets file" do
      described_class.write_secrets(openai_access_token: "sk-test")

      mode = File.stat(Autodidact::Config::Path.secrets_file).mode & 0o777
      expect(mode).to eq(0o600)
    end
  end

  describe ".read_config" do
    it "returns empty hash when file does not exist" do
      expect(described_class.read_config).to eq({})
    end
  end

  describe ".read_secrets" do
    it "returns empty hash when file does not exist" do
      expect(described_class.read_secrets).to eq({})
    end
  end
end
