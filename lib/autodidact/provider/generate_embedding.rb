# frozen_string_literal: true

require "openai"

module Autodidact
  module Provider
    class GenerateEmbedding < Query
      MODEL = "text-embedding-3-small"

      def initialize(text:, access_token:)
        @text = text
        @access_token = access_token
      end

      def call
        response = client.embeddings(parameters: {model: MODEL, input: text})
        embedding = extract_embedding(response)
        success(payload: embedding)
      rescue Faraday::Error => e
        failure(e)
      end

      private

      attr_reader :text, :access_token

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
