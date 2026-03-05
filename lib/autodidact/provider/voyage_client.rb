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
        parse_embeddings(post(input: [text])).first
      rescue Faraday::Error => e
        raise ProviderError, e.message
      end

      def embed_batch(texts:)
        parse_embeddings(post(input: texts))
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

      def post(input:)
        response = connection.post do |req|
          req.body = JSON.dump(input: input, model: model)
        end
        raise ProviderError, "Voyage request failed: #{response.status}" unless response.success?

        response.body
      end

      def parse_embeddings(body)
        data = JSON.parse(body)["data"]
        raise ProviderError, "Batch embedding response was empty" if data.nil? || data.empty?

        data.sort_by { |d| d["index"] }.map { |d| d["embedding"] }
      end
    end
  end
end
