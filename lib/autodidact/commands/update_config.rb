# frozen_string_literal: true

module Autodidact
  module Commands
    class UpdateConfig < ApplicationCommand
      CONFIG_KEYS = %i[database_url obsidian_vault_path openai_model].freeze
      SECRET_KEYS = %i[openai_access_token].freeze

      def call(params:, notify:)
        Config::Store.write_config(config_payload(params))
        Config::Store.write_secrets(secrets_payload(params))
        Autodidact.reset_config!

        status = Config::Validator.call(config: Autodidact.config)

        success(payload: {
          status: status.ready? ? "ready" : "needs_setup",
          missing_fields: status.missing_fields
        })
      end

      private

      def config_payload(params)
        Configuration::DEFAULTS
          .merge(Config::Store.read_config)
          .merge(params.slice(*CONFIG_KEYS))
      end

      def secrets_payload(params)
        Config::Store.read_secrets.merge(params.slice(*SECRET_KEYS))
      end
    end
  end
end
