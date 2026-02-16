# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Config::Validator do
  describe ".call" do
    it "returns ready when all required fields present" do
      data = {
        database_url: "postgres://localhost/test",
        obsidian_vault_path: "/vault",
        openai_access_token: "sk-test"
      }

      result = described_class.call(data: data)

      expect(result[:ready]).to be true
      expect(result[:missing_fields]).to be_empty
    end

    it "returns not ready with missing fields listed" do
      result = described_class.call(data: {})

      expect(result[:ready]).to be false
      expect(result[:missing_fields]).to contain_exactly(
        :database_url, :obsidian_vault_path, :openai_access_token
      )
    end

    it "treats blank strings as missing" do
      data = {
        database_url: "  ",
        obsidian_vault_path: "",
        openai_access_token: nil
      }

      result = described_class.call(data: data)

      expect(result[:ready]).to be false
      expect(result[:missing_fields]).to contain_exactly(
        :database_url, :obsidian_vault_path, :openai_access_token
      )
    end

    it "ignores extra fields" do
      data = {
        database_url: "postgres://localhost/test",
        obsidian_vault_path: "/vault",
        openai_access_token: "sk-test",
        openai_model: "gpt-4o"
      }

      result = described_class.call(data: data)

      expect(result[:ready]).to be true
    end
  end
end
