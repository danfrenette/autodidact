# frozen_string_literal: true

module Autodidact
  module Config
    class Validator
      Status = Data.define(:missing_fields) do
        def ready?
          missing_fields.empty?
        end
      end

      REQUIRED_FIELDS = %i[
        obsidian_vault_path
        openai_access_token
      ].freeze

      def self.call(config:)
        new(config: config).call
      end

      def initialize(config:)
        @config_data = config.to_h
      end

      def call
        missing = REQUIRED_FIELDS.select { |key| blank?(config_data[key]) }
        Status.new(missing_fields: missing)
      end

      private

      attr_reader :config_data

      def blank?(value)
        value.nil? || value.to_s.strip.empty?
      end
    end
  end
end
