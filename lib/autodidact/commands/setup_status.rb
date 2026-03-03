# frozen_string_literal: true

module Autodidact
  module Commands
    class SetupStatus < Query
      def call
        status = Config::Validator.call(config: Autodidact.config)
        success(payload: {
          status: status.ready? ? "ready" : "needs_setup",
          missing_fields: status.missing_fields,
          prefill: prefill_data,
          provider_options: model_catalog.fetch(:chat_provider_options),
          provider_model_options: model_catalog.fetch(:chat_provider_model_options),
          embedding_provider_options: model_catalog.fetch(:embedding_provider_options),
          embedding_provider_model_options: model_catalog.fetch(:embedding_provider_model_options)
        })
      end

      private

      def prefill_data
        base = Autodidact.config.to_h
        return base unless blank?(base[:obsidian_vault_path])

        base.merge(obsidian_vault_path: Config::DetectVaultPath.call)
      end

      def blank?(value)
        value.nil? || value.to_s.strip.empty?
      end

      def model_catalog
        result = Config::ModelCatalog.call
        raise result.error[:message] if result.failure?

        result.payload
      end
    end
  end
end
