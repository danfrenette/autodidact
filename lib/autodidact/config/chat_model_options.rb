# frozen_string_literal: true

module Autodidact
  module Config
    class ChatModelOptions < Query
      PROVIDER_FAMILIES = {
        "openai" => %w[gpt gpt-pro],
        "anthropic" => %w[claude-sonnet claude-haiku claude-opus]
      }.freeze

      def initialize(provider_id:)
        @provider_id = provider_id.to_s
      end

      def call
        success(payload: model_ids)
      end

      private

      attr_reader :provider_id

      def model_ids
        ModelOptions.call(provider_id: provider_id, families: families)
      end

      def families
        PROVIDER_FAMILIES.fetch(provider_id, [])
      end
    end
  end
end
