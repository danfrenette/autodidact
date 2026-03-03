# frozen_string_literal: true

module Autodidact
  module Commands
    class UpdateConfig < Command
      CONFIG_KEYS = %i[database_url provider obsidian_vault_path model embedding_provider embedding_model].freeze

      def initialize(params:, **)
        @params = params
      end

      def call
        Config::Store.write_config(config_payload)
        Config::Store.write_secrets(secrets_payload)
        Autodidact.reset_config!
        Autodidact::DB.reset!
        status = Config::Validator.call(config: Autodidact.config)
        Autodidact::DB.connection if status.ready?
        success(payload: {
          status: status.ready? ? "ready" : "needs_setup",
          missing_fields: status.missing_fields,
          provider: Autodidact.config.provider,
          model: Autodidact.config.model
        })
      end

      private

      attr_reader :params

      def config_payload
        Configuration::DEFAULTS
          .merge(Config::Store.read_config)
          .merge(params.slice(*CONFIG_KEYS))
      end

      def secrets_payload
        merge_incoming_tokens(Config::Store.read_secrets)
      end

      def merge_incoming_tokens(existing)
        token_provider_ids.each_with_object(existing) do |provider_id, secrets|
          token = incoming_token_for(provider_id)
          secrets[:"token_#{provider_id}"] = token if token
        end
      end

      def token_provider_ids
        (Configuration::CHAT_PROVIDERS - ["dev"] + Configuration::EMBEDDING_PROVIDERS).uniq
      end

      def incoming_token_for(provider_id)
        incoming_tokens = params.fetch(:tokens, {})
        token = incoming_tokens[provider_id] || incoming_tokens[provider_id.to_sym]
        token unless token.nil? || token.strip.empty?
      end
    end
  end
end
