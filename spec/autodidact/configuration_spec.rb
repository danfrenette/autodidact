# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Configuration do
  before do
    allow(Autodidact::Config::Store).to receive(:read_config).and_return({})
    allow(Autodidact::Config::Store).to receive(:read_secrets).and_return({})
  end

  subject(:config) { described_class.new }

  describe "#access_token" do
    it "returns token from secrets file" do
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return(access_token: "sk-from-file")

      expect(config.access_token).to eq("sk-from-file")
    end

    it "prefers ENV over secrets file" do
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return(access_token: "sk-from-file")

      ClimateControl.modify(ACCESS_TOKEN: "sk-from-env") do
        config = described_class.new
        expect(config.access_token).to eq("sk-from-env")
      end
    end

    it "returns nil when missing everywhere" do
      expect(config.access_token).to be_nil
    end
  end

  describe "#model" do
    it "defaults to gpt-4o-mini" do
      expect(config.model).to eq("gpt-4o-mini")
    end

    it "reads from config file" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(model: "gpt-4o")

      expect(config.model).to eq("gpt-4o")
    end

    it "prefers ENV over config file" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(model: "gpt-4o")

      ClimateControl.modify(MODEL: "gpt-4-turbo") do
        config = described_class.new
        expect(config.model).to eq("gpt-4-turbo")
      end
    end
  end

  describe "#provider" do
    it "defaults to openai" do
      expect(config.provider).to eq("openai")
    end

    it "reads from config file" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(provider: "dev")

      expect(config.provider).to eq("dev")
    end

    it "prefers ENV over config file" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(provider: "dev")

      ClimateControl.modify(AUTODIDACT_PROVIDER: "openai") do
        config = described_class.new
        expect(config.provider).to eq("openai")
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

    it "defaults to local autodidact database on 5432" do
      expect(config.database_url).to eq("postgres://localhost:5432/autodidact")
    end
  end

  describe "#ready?" do
    it "returns true when all required fields present for openai" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(
        database_url: "postgres://localhost/test",
        obsidian_vault_path: "/vault"
      )
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return(
        access_token: "sk-test"
      )

      expect(config.ready?).to be true
    end

    it "returns true for dev provider without access token" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(
        database_url: "postgres://localhost/test",
        obsidian_vault_path: "/vault",
        provider: "dev"
      )
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return({})

      expect(config.ready?).to be true
    end

    it "returns false when fields are missing" do
      expect(config.ready?).to be false
    end
  end

  describe "precedence" do
    it "ENV > secrets > config > defaults" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(model: "from-config")
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return(model: "from-secrets")

      ClimateControl.modify(MODEL: "from-env") do
        config = described_class.new
        expect(config.model).to eq("from-env")
      end
    end

    it "secrets override config" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(model: "from-config")
      allow(Autodidact::Config::Store).to receive(:read_secrets).and_return(model: "from-secrets")

      expect(config.model).to eq("from-secrets")
    end

    it "config overrides defaults" do
      allow(Autodidact::Config::Store).to receive(:read_config).and_return(model: "from-config")

      expect(config.model).to eq("from-config")
    end
  end
end
