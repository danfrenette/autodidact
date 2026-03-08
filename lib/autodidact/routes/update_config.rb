# frozen_string_literal: true

module Autodidact
  module Routes
    class UpdateConfig < Route
      def call
        Commands::UpdateConfig.call(
          database_url: params[:database_url],
          provider: params[:provider],
          obsidian_vault_path: params[:obsidian_vault_path],
          model: params[:model],
          embedding_provider: params[:embedding_provider],
          embedding_model: params[:embedding_model],
          tokens: params.fetch(:tokens, {})
        )
      end
    end
  end
end
