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
        extract_embeddings(client.embeddings(parameters: {model: model, input: text})).first
      rescue Faraday::Error => e
        raise ProviderError, e.message
      end

      def embed_batch(texts:)
        extract_embeddings(client.embeddings(parameters: {model: model, input: texts}))
      rescue Faraday::Error => e
        raise ProviderError, e.message
      end

      private

      attr_reader :access_token, :model

      def client
        OpenAI::Client.new(access_token: access_token)
      end

      def extract_embeddings(response)
        data = response["data"]
        raise ProviderError, "Embedding response was empty" if data.nil? || data.empty?

        data.sort_by { |d| d["index"] }.map { |d| d["embedding"] }
      end
    end
  end
end
