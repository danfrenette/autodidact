# frozen_string_literal: true

module Autodidact
  module Provider
    class GenerateBatchEmbeddings < Query
      def initialize(texts:)
        @texts = texts
      end

      def call
        return success(payload: []) if texts.empty?

        embeddings = Provider.embedding_client.embed_batch(texts: texts)
        success(payload: embeddings)
      rescue ProviderError, Faraday::Error => e
        failure(e)
      end

      private

      attr_reader :texts
    end
  end
end
