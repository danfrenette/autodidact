# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Configuration do
  before do
    allow(Autodidact::Config::Store).to receive(:read_config).and_return({})
    allow(Autodidact::Config::Store).to receive(:read_secrets).and_return({})
  end

  subject(:config) { described_class.new }

  describe "#openai_access_token" do
    it "returns token from secrets file" do
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return(openai_access_token: "sk-from-file")

      expect(config.openai_access_token).to eq("sk-from-file")
    end

    it "prefers ENV over secrets file" do
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return(openai_access_token: "sk-from-file")

      ClimateControl.modify(OPENAI_ACCESS_TOKEN: "sk-from-env") do
        config = described_class.new
        expect(config.openai_access_token).to eq("sk-from-env")
      end
    end

    it "returns nil when missing everywhere" do
      expect(config.openai_access_token).to be_nil
    end
  end

  describe "#openai_model" do
    it "defaults to gpt-4o-mini" do
      expect(config.openai_model).to eq("gpt-4o-mini")
    end

    it "reads from config file" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(openai_model: "gpt-4o")

      expect(config.openai_model).to eq("gpt-4o")
    end

    it "prefers ENV over config file" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(openai_model: "gpt-4o")

      ClimateControl.modify(OPENAI_MODEL: "gpt-4-turbo") do
        config = described_class.new
        expect(config.openai_model).to eq("gpt-4-turbo")
      end
    end
  end

  describe "#obsidian_vault_path" do
    it "returns path from config file" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(obsidian_vault_path: "/vault")

      expect(config.obsidian_vault_path).to eq("/vault")
    end

    it "returns nil when missing everywhere" do
      expect(config.obsidian_vault_path).to be_nil
    end
  end

  describe "#database_url" do
    it "returns URL from config file" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(database_url: "postgres://localhost/test")

      expect(config.database_url).to eq("postgres://localhost/test")
    end

    it "defaults to local postgres on 5432" do
      expect(config.database_url).to eq("postgres://localhost:5432/postgres")
    end
  end

  describe "#ready?" do
    it "returns true when all required fields present" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(
        database_url: "postgres://localhost/test",
        obsidian_vault_path: "/vault"
      )
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return(
        openai_access_token: "sk-test"
      )

      expect(config.ready?).to be true
    end

    it "returns false when fields are missing" do
      expect(config.ready?).to be false
    end
  end

  describe "precedence" do
    it "ENV > secrets > config > defaults" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(openai_model: "from-config")
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return(openai_model: "from-secrets")

      ClimateControl.modify(OPENAI_MODEL: "from-env") do
        config = described_class.new
        expect(config.openai_model).to eq("from-env")
      end
    end

    it "secrets override config" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(openai_model: "from-config")
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return(openai_model: "from-secrets")

      expect(config.openai_model).to eq("from-secrets")
    end

    it "config overrides defaults" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(openai_model: "from-config")

      expect(config.openai_model).to eq("from-config")
    end
  end
end
