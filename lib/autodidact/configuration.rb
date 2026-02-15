# frozen_string_literal: true

module Autodidact
  class Configuration
    class ConfigurationError < StandardError; end

    def openai_access_token
      ENV.fetch("OPENAI_ACCESS_TOKEN")
    rescue KeyError
      raise ConfigurationError, "OPENAI_ACCESS_TOKEN is not set"
    end

    def openai_model
      ENV.fetch("OPENAI_MODEL", "gpt-4o-mini")
    end

    def obsidian_vault_path
      ENV.fetch("OBSIDIAN_VAULT_PATH")
    rescue KeyError
      raise ConfigurationError, "OBSIDIAN_VAULT_PATH is not set"
    end

    def database_url
      ENV.fetch("DATABASE_URL")
    rescue KeyError
      raise ConfigurationError, "DATABASE_URL is not set"
    end
  end
end
