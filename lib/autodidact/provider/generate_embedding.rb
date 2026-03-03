# frozen_string_literal: true

require "openai"

module Autodidact
  module Provider
    class GenerateEmbedding < Query
      def initialize(text:)
        @text = text
      end

      def call
        embedding = client.embed(text: text)
        success(payload: embedding)
      rescue ProviderError, Faraday::Error => e
        failure(e)
      end

      private

      attr_reader :text

      def client
        case Autodidact.config.embedding_provider
        when "openai"
          OpenaiEmbeddingClient.new(
            access_token: Autodidact.config.embedding_access_token,
            model: Autodidact.config.embedding_model
          )
        when "voyage"
          VoyageClient.new(
            access_token: Autodidact.config.embedding_access_token,
            model: Autodidact.config.embedding_model
          )
        else
          raise ProviderError, "Unknown embedding provider: #{Autodidact.config.embedding_provider}"
        end
      end
    end
  end
end
