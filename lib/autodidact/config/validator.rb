# frozen_string_literal: true

module Autodidact
  module Config
    class Validator
      DEV = "dev"

      Status = Data.define(:missing_fields) do
        def ready?
          missing_fields.empty?
        end
      end

      def self.call(config:)
        new(config: config).call
      end

      def initialize(config:)
        @config = config
      end

      def call
        Status.new(missing_fields: missing_fields)
      end

      private

      attr_reader :config

      def missing_fields
        fields = []
        fields << :obsidian_vault_path unless valid_obsidian_vault_path?
        return fields if dev?

        fields << :access_token unless valid_access_token?
        fields << :embedding_provider unless valid_embedding_provider?
        fields << :embedding_model unless valid_embedding_model?
        fields << :embedding_access_token unless valid_embedding_access_token?
        fields
      end

      def dev?
        config.provider == DEV
      end

      def valid_obsidian_vault_path?
        present?(config.obsidian_vault_path)
      end

      def valid_access_token?
        present?(config.access_token)
      end

      def valid_embedding_provider?
        present?(config.embedding_provider)
      end

      def valid_embedding_model?
        present?(config.embedding_model)
      end

      def valid_embedding_access_token?
        present?(config.embedding_access_token)
      end

      def present?(value)
        !value.nil? && !value.to_s.strip.empty?
      end
    end
  end
end
