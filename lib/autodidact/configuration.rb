# frozen_string_literal: true

module Autodidact
  class Configuration
    class ConfigurationError < StandardError; end

    DEFAULTS = {openai_model: "gpt-4o-mini"}.freeze

    ENV_KEYS = {
      database_url: "DATABASE_URL",
      obsidian_vault_path: "OBSIDIAN_VAULT_PATH",
      openai_access_token: "OPENAI_ACCESS_TOKEN",
      openai_model: "OPENAI_MODEL"
    }.freeze

    def initialize
      @data = load_data
    end

    def openai_access_token
      require_value(:openai_access_token)
    end

    def openai_model
      data[:openai_model]
    end

    def obsidian_vault_path
      require_value(:obsidian_vault_path)
    end

    def database_url
      require_value(:database_url)
    end

    def ready?
      Config::Validator.call(data: data)[:ready]
    end

    def to_h
      data.dup
    end

    private

    attr_reader :data

    def load_data
      DEFAULTS
        .merge(Config::Store.read_config)
        .merge(Config::Store.read_secrets)
        .merge(env_overrides)
    end

    def env_overrides
      ENV_KEYS.each_with_object({}) do |(key, env_name), overrides|
        value = ENV.fetch(env_name, nil)
        overrides[key] = value unless value.nil?
      end
    end

    def require_value(key)
      data.fetch(key) do
        raise ConfigurationError, "#{ENV_KEYS[key]} is not set"
      end.then do |value|
        raise ConfigurationError, "#{ENV_KEYS[key]} is not set" if value.to_s.strip.empty?

        value
      end
    end
  end
end
