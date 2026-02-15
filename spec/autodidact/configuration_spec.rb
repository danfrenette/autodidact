# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Configuration do
  subject(:config) { described_class.new }

  describe "#openai_access_token" do
    it "returns the token when set" do
      allow(ENV).to receive(:fetch).with("OPENAI_ACCESS_TOKEN").and_return("sk-test")

      expect(config.openai_access_token).to eq("sk-test")
    end

    it "raises ConfigurationError when missing" do
      allow(ENV).to receive(:fetch).with("OPENAI_ACCESS_TOKEN").and_raise(KeyError)

      expect { config.openai_access_token }.to raise_error(
        Autodidact::Configuration::ConfigurationError,
        "OPENAI_ACCESS_TOKEN is not set"
      )
    end
  end

  describe "#openai_model" do
    it "returns the configured model" do
      allow(ENV).to receive(:fetch).with("OPENAI_MODEL", "gpt-4o-mini").and_return("gpt-4o")

      expect(config.openai_model).to eq("gpt-4o")
    end

    it "defaults to gpt-4o-mini" do
      allow(ENV).to receive(:fetch).with("OPENAI_MODEL", "gpt-4o-mini").and_call_original

      expect(config.openai_model).to eq("gpt-4o-mini")
    end
  end

  describe "#obsidian_vault_path" do
    it "returns the path when set" do
      allow(ENV).to receive(:fetch).with("OBSIDIAN_VAULT_PATH").and_return("/vault")

      expect(config.obsidian_vault_path).to eq("/vault")
    end

    it "raises ConfigurationError when missing" do
      allow(ENV).to receive(:fetch).with("OBSIDIAN_VAULT_PATH").and_raise(KeyError)

      expect { config.obsidian_vault_path }.to raise_error(
        Autodidact::Configuration::ConfigurationError,
        "OBSIDIAN_VAULT_PATH is not set"
      )
    end
  end

  describe "#database_url" do
    it "returns the URL when set" do
      allow(ENV).to receive(:fetch).with("DATABASE_URL").and_return("postgres://localhost/test")

      expect(config.database_url).to eq("postgres://localhost/test")
    end

    it "raises ConfigurationError when missing" do
      allow(ENV).to receive(:fetch).with("DATABASE_URL").and_raise(KeyError)

      expect { config.database_url }.to raise_error(
        Autodidact::Configuration::ConfigurationError,
        "DATABASE_URL is not set"
      )
    end
  end
end
