# frozen_string_literal: true

module Autodidact
  module Commands
    class UpdateConfig < ApplicationCommand
      CONFIG_KEYS = %i[database_url obsidian_vault_path openai_model].freeze
      SECRET_KEYS = %i[openai_access_token].freeze

      def call(params:, notify:)
        Config::Store.write_config(params.slice(*CONFIG_KEYS))
        Config::Store.write_secrets(params.slice(*SECRET_KEYS))
        Autodidact.reset_config!

        status = Config::Validator.call(config: Autodidact.config)

        success(payload: {
          status: status.ready? ? "ready" : "needs_setup",
          missing_fields: status.missing_fields
        })
      end
    end
  end
end
