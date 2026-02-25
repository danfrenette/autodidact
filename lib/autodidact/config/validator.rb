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
        @config_data = config.to_h
      end

      def call
        missing = required_fields.select { |key| blank?(config_data[key]) }
        Status.new(missing_fields: missing)
      end

      private

      attr_reader :config_data

      def required_fields
        return %i[obsidian_vault_path] if config_data[:provider] == DEV

        %i[obsidian_vault_path access_token]
      end

      def blank?(value)
        value.nil? || value.to_s.strip.empty?
      end
    end
  end
end
