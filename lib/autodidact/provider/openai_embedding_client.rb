# frozen_string_literal: true

require "openai"

module Autodidact
  module Provider
    class OpenaiEmbeddingClient
      def initialize(access_token:, model:)
        @access_token = access_token
        @model = model
      end

      def embed(text:)
        response = client.embeddings(parameters: {model: model, input: text})
        extract_embedding(response)
      rescue Faraday::Error => e
        raise ProviderError, e.message
      end

      private

      attr_reader :access_token, :model

      def client
        OpenAI::Client.new(access_token: access_token)
      end

      def extract_embedding(response)
        embedding = response.dig("data", 0, "embedding")
        raise ProviderError, "Embedding response was empty" if embedding.nil? || embedding.empty?

        embedding
      end
    end
  end
end
