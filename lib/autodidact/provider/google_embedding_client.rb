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
        response = connection.post do |req|
          req.body = JSON.dump(
            content: {parts: [{text: text}]},
            output_dimensionality: 1536
          )
        end

        raise ProviderError, "Google embedding request failed: #{response.status}" unless response.success?

        parse_embedding(response.body)
      rescue Faraday::Error => e
        raise ProviderError, e.message
      end

      private

      attr_reader :access_token, :model

      def connection
        url = "#{API_BASE}/#{model}:embedContent?key=#{access_token}"
        Faraday.new(url: url) do |conn|
          conn.headers["Content-Type"] = "application/json"
        end
      end

      def parse_embedding(body)
        parsed = JSON.parse(body)
        embedding = parsed.dig("embedding", "values")
        raise ProviderError, "Embedding response was empty" if embedding.nil? || embedding.empty?

        embedding
      rescue JSON::ParserError => e
        raise ProviderError, "Failed to parse Google embedding response: #{e.message}"
      end
    end
  end
end
