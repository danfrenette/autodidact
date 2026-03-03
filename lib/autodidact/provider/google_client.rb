# frozen_string_literal: true

require "faraday"
require "json"

module Autodidact
  module Provider
    class GoogleClient
      API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

      def initialize(access_token:, model:)
        @access_token = access_token
        @model = model
      end

      def chat(prompt:)
        response = connection.post do |req|
          req.body = JSON.dump(contents: [{parts: [{text: prompt}]}])
        end

        raise ProviderError, "Google request failed: #{response.status}" unless response.success?

        parse_content(response.body)
      rescue Faraday::Error => e
        raise ProviderError, e.message
      end

      private

      attr_reader :access_token, :model

      def connection
        url = "#{API_BASE}/#{model}:generateContent?key=#{access_token}"
        Faraday.new(url: url) do |conn|
          conn.headers["Content-Type"] = "application/json"
        end
      end

      def parse_content(body)
        parsed = JSON.parse(body)
        content = parsed.dig("candidates", 0, "content", "parts", 0, "text")
        raise ProviderError, "Provider returned empty content" if blank?(content)

        content
      rescue JSON::ParserError => e
        raise ProviderError, "Failed to parse Google response: #{e.message}"
      end

      def blank?(value)
        value.nil? || value.to_s.strip.empty?
      end
    end
  end
end
