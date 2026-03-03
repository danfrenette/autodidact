# frozen_string_literal: true

require "faraday"
require "json"

module Autodidact
  module Provider
    class VoyageClient
      API_URL = "https://api.voyageai.com/v1/embeddings"

      def initialize(access_token:, model:)
        @access_token = access_token
        @model = model
      end

      def embed(text:)
        response = connection.post do |req|
          req.body = JSON.dump(input: [text], model: model)
        end

        raise ProviderError, "Voyage request failed: #{response.status}" unless response.success?

        parse_embedding(response.body)
      rescue Faraday::Error => e
        raise ProviderError, e.message
      end

      private

      attr_reader :access_token, :model

      def connection
        Faraday.new(url: API_URL) do |conn|
          conn.headers["Authorization"] = "Bearer #{access_token}"
          conn.headers["Content-Type"] = "application/json"
          conn.request :json
        end
      end

      def parse_embedding(body)
        parsed = JSON.parse(body)
        embedding = parsed.dig("data", 0, "embedding")
        raise ProviderError, "Embedding response was empty" if embedding.nil? || embedding.empty?

        embedding
      end
    end
  end
end
