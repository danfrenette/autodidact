# frozen_string_literal: true

module Autodidact
  module Provider
    class ProviderError < StandardError; end

    EMBEDDING_DIMENSIONS = 1536

    def self.embedding_client
      config = Autodidact.config
      case config.embedding_provider
      when "openai"
        OpenaiEmbeddingClient.new(access_token: config.embedding_access_token, model: config.embedding_model)
      when "voyage"
        VoyageClient.new(access_token: config.embedding_access_token, model: config.embedding_model)
      when "google"
        GoogleEmbeddingClient.new(access_token: config.embedding_access_token, model: config.embedding_model)
      else
        raise ProviderError, "Unknown embedding provider: #{config.embedding_provider}"
      end
    end
  end
end
