# frozen_string_literal: true

module Autodidact
  module Routes
    class UpdateConfig < Route
      def call
        Commands::UpdateConfig.call(params: config_params)
      end

      private

      def config_params
        params.slice(
          :database_url,
          :provider,
          :obsidian_vault_path,
          :model,
          :embedding_provider,
          :embedding_model,
          :tokens
        )
      end
    end
  end
end
