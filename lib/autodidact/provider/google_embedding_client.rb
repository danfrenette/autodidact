# frozen_string_literal: true

require "faraday"
require "json"

module Autodidact
  module Provider
    class GoogleEmbeddingClient
      API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

      def initialize(access_token:, model:)
        @access_token = access_token
        @model = model
      end

      def embed(text:)
        response = connection("embedContent").post do |req|
          req.body = JSON.dump(
            content: {parts: [{text: text}]},
            output_dimensionality: EMBEDDING_DIMENSIONS
          )
        end

        raise ProviderError, "Google embedding request failed: #{response.status}" unless response.success?

        parse_embedding(response.body)
      rescue Faraday::Error => e
        raise ProviderError, e.message
      end

      def embed_batch(texts:)
        response = connection("batchEmbedContents").post do |req|
          req.body = JSON.dump(
            requests: texts.map do |text|
              {
                model: "models/#{model}",
                content: {parts: [{text: text}]},
                output_dimensionality: EMBEDDING_DIMENSIONS
              }
            end
          )
        end

        raise ProviderError, "Google batch embedding failed: #{response.status}" unless response.success?

        parse_batch_embeddings(response.body)
      rescue Faraday::Error => e
        raise ProviderError, e.message
      end

      private

      attr_reader :access_token, :model

      def connection(action)
        Faraday.new(url: "#{API_BASE}/#{model}:#{action}?key=#{access_token}") do |conn|
          conn.headers["Content-Type"] = "application/json"
        end
      end

      def parse_response(body)
        JSON.parse(body)
      rescue JSON::ParserError => e
        raise ProviderError, "Failed to parse Google embedding response: #{e.message}"
      end

      def parse_embedding(body)
        embedding = parse_response(body).dig("embedding", "values")
        raise ProviderError, "Embedding response was empty" if embedding.nil? || embedding.empty?

        embedding
      end

      def parse_batch_embeddings(body)
        embeddings = parse_response(body)["embeddings"]
        raise ProviderError, "Batch embedding response was empty" if embeddings.nil? || embeddings.empty?

        embeddings.map { |e| e["values"] }
      end
    end
  end
end
