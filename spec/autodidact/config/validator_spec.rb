# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Config::Validator do
  describe ".call" do
    def build_config(data)
      instance_double(Autodidact::Configuration, to_h: data)
    end

    it "returns ready when all required fields present" do
      config = build_config(
        database_url: "postgres://localhost/test",
        obsidian_vault_path: "/vault",
        openai_access_token: "sk-test"
      )

      result = described_class.call(config: config)

      expect(result).to be_ready
      expect(result.missing_fields).to be_empty
    end

    it "returns not ready with missing fields listed" do
      result = described_class.call(config: build_config({}))

      expect(result).not_to be_ready
      expect(result.missing_fields).to contain_exactly(
        :obsidian_vault_path, :openai_access_token
      )
    end

    it "treats blank strings as missing" do
      config = build_config(
        database_url: "  ",
        obsidian_vault_path: "",
        openai_access_token: nil
      )

      result = described_class.call(config: config)

      expect(result).not_to be_ready
      expect(result.missing_fields).to contain_exactly(
        :obsidian_vault_path, :openai_access_token
      )
    end

    it "ignores extra fields" do
      config = build_config(
        database_url: "postgres://localhost/test",
        obsidian_vault_path: "/vault",
        openai_access_token: "sk-test",
        openai_model: "gpt-4o"
      )

      result = described_class.call(config: config)

      expect(result).to be_ready
    end
  end
end
