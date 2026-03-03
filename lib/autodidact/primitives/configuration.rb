# frozen_string_literal: true

module Autodidact
  class Configuration
    DEFAULTS = {
      database_url: "postgres://localhost:5432/autodidact",
      model: "gpt-4o-mini",
      provider: "openai",
      embedding_provider: "openai",
      embedding_model: "text-embedding-3-small"
    }.freeze

    ENV_KEYS = {
      database_url: "DATABASE_URL",
      obsidian_vault_path: "OBSIDIAN_VAULT_PATH",
      model: "AUTODIDACT_MODEL",
      provider: "AUTODIDACT_PROVIDER",
      embedding_provider: "AUTODIDACT_EMBEDDING_PROVIDER",
      embedding_model: "AUTODIDACT_EMBEDDING_MODEL"
    }.freeze

    CHAT_PROVIDERS = %w[openai anthropic dev].freeze
    EMBEDDING_PROVIDERS = %w[openai voyage].freeze

    attr_reader :database_url, :obsidian_vault_path, :model, :provider,
      :embedding_provider, :embedding_model

    def initialize
      config = DEFAULTS
        .merge(Config::Store.read_config)
        .merge(env_overrides)

      @database_url = config[:database_url]
      @obsidian_vault_path = config[:obsidian_vault_path]
      @model = config[:model]
      @provider = config[:provider]
      @embedding_provider = config[:embedding_provider]
      @embedding_model = config[:embedding_model]
      @tokens = Config::Store.read_secrets
    end

    def access_token
      token_for(provider)
    end

    def embedding_access_token
      token_for(embedding_provider)
    end

    def token_for(provider_id)
      @tokens[:"token_#{provider_id}"]
    end

    def ready?
      Config::Validator.call(config: self).ready?
    end

    def to_h
      {
        database_url: database_url,
        obsidian_vault_path: obsidian_vault_path,
        model: model,
        provider: provider,
        embedding_provider: embedding_provider,
        embedding_model: embedding_model
      }
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
