# frozen_string_literal: true

module Autodidact
  module Commands
    class SetupStatus < ApplicationCommand
      def call(params:, notify:)
        status = Config::Validator.call(config: Autodidact.config)
        prefill = prefill_data

        success(payload: {
          status: status.ready? ? "ready" : "needs_setup",
          missing_fields: status.missing_fields,
          prefill: prefill,
          model_options: Config::ModelOptions.call
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
    end
  end
end
