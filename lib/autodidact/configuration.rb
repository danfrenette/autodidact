# frozen_string_literal: true

module Autodidact
  class Configuration
    DEFAULTS = {openai_model: "gpt-4o-mini"}.freeze

    ENV_KEYS = {
      database_url: "DATABASE_URL",
      obsidian_vault_path: "OBSIDIAN_VAULT_PATH",
      openai_access_token: "OPENAI_ACCESS_TOKEN",
      openai_model: "OPENAI_MODEL"
    }.freeze

    attr_reader :database_url, :obsidian_vault_path,
      :openai_access_token, :openai_model

    def initialize
      data = DEFAULTS
        .merge(Config::Store.read_config)
        .merge(Config::Store.read_secrets)
        .merge(env_overrides)

      @database_url = data[:database_url]
      @obsidian_vault_path = data[:obsidian_vault_path]
      @openai_access_token = data[:openai_access_token]
      @openai_model = data[:openai_model]
    end

    def ready?
      Config::Validator.call(config: self).ready?
    end

    def to_h
      ENV_KEYS.keys.each_with_object({}) do |key, hash|
        hash[key] = public_send(key)
      end
    end

    private

    def env_overrides
      ENV_KEYS.each_with_object({}) do |(key, env_name), overrides|
        value = ENV.fetch(env_name, nil)
        overrides[key] = value unless value.nil?
      end
    end
  end
end
