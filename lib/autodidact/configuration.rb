# frozen_string_literal: true

module Autodidact
  class Configuration
    DEFAULTS = {
      database_url: "postgres://localhost:5432/autodidact",
      model: "gpt-4o-mini",
      provider: "openai"
    }.freeze

    ENV_KEYS = {
      database_url: "DATABASE_URL",
      obsidian_vault_path: "OBSIDIAN_VAULT_PATH",
      access_token: "ACCESS_TOKEN",
      model: "MODEL",
      provider: "AUTODIDACT_PROVIDER"
    }.freeze

    attr_reader :database_url, :obsidian_vault_path,
      :access_token, :model, :provider

    def initialize
      data = DEFAULTS
        .merge(Config::Store.read_config)
        .merge(Config::Store.read_secrets)
        .merge(env_overrides)

      @database_url = data[:database_url]
      @obsidian_vault_path = data[:obsidian_vault_path]
      @access_token = data[:access_token]
      @model = data[:model]
      @provider = data[:provider]
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
