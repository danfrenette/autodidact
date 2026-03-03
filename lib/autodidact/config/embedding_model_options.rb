# frozen_string_literal: true

module Autodidact
  module Config
    class EmbeddingModelOptions < Query
      PROVIDER_FAMILIES = {
        "openai" => ["text-embedding"],
        "voyage" => ["voyage"]
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
