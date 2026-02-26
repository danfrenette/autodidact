# frozen_string_literal: true

module Autodidact
  module Commands
    class SetupStatus < Command
      def call(params:, notify:)
        status = Config::Validator.call(config: Autodidact.config)
        prefill = prefill_data

        success(payload: {
                  status: status.ready? ? 'ready' : 'needs_setup',
                  missing_fields: status.missing_fields,
                  prefill: prefill,
                  provider_options: Config::Providers::Catalog.setup_visible_ids,
                  provider_model_options: provider_model_options
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

      def provider_model_options
        Config::Providers::Catalog.setup_visible.each_with_object({}) do |provider, map|
          map[provider.id] = provider.model_options
        end
      end
    end
  end
end
