# frozen_string_literal: true

require "openai"

module Autodidact
  module Provider
    class OpenaiClient
      def initialize(access_token:, model:)
        @client = OpenAI::Client.new(access_token: access_token)
        @model = model
      end

      def chat(prompt:)
        response = client.chat(parameters: parameters(prompt))
        extract_content(response)
      end

      private

      attr_reader :client, :model

      def parameters(prompt)
        {model: model, messages: [{role: "user", content: prompt}]}
      end

      def extract_content(response)
        content = response.dig("choices", 0, "message", "content")
        raise StandardError, "Provider returned empty content" if blank?(content)

        content
      end

      def blank?(value)
        value.nil? || value.to_s.strip.empty?
      end
    end
  end
end
