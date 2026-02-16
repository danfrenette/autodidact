# frozen_string_literal: true

module Autodidact
  module Config
    class Validator
      REQUIRED_FIELDS = %i[
        database_url
        obsidian_vault_path
        openai_access_token
      ].freeze

      def self.call(data:)
        new(data: data).call
      end

      def initialize(data:)
        @data = data
      end

      def call
        missing = REQUIRED_FIELDS.select { |key| blank?(data[key]) }
        {ready: missing.empty?, missing_fields: missing}
      end

      private

      attr_reader :data

      def blank?(value)
        value.nil? || value.to_s.strip.empty?
      end
    end
  end
end
