# frozen_string_literal: true

module Autodidact
  module Commands
    class ListVaultTags < Query
      def call
        success(payload: {tags: vault_tags.merge(db_tags).sort})
      end

      private

      def vault_tags
        Retrieval::VaultTagScanner.new(
          vault_path: Autodidact.config.obsidian_vault_path
        ).call
      end

      def db_tags
        Models::Tag.select_map(:name)
      end
    end
  end
end
