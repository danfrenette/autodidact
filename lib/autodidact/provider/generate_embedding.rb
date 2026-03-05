# frozen_string_literal: true

require "openai"

module Autodidact
  module Provider
    class GenerateEmbedding < Query
      def initialize(text:)
        @text = text
      end

      def call
        embedding = Provider.embedding_client.embed(text: text)
        success(payload: embedding)
      rescue ProviderError, Faraday::Error => e
        failure(e)
      end

      private

      attr_reader :text
    end
  end
end
