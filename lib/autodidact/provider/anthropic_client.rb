# frozen_string_literal: true

require "anthropic"

module Autodidact
  module Provider
    class AnthropicClient
      MAX_TOKENS = 4096

      def initialize(access_token:, model:)
        @client = Anthropic::Client.new(api_key: access_token)
        @model = model
      end

      def chat(prompt:)
        message = client.messages.create(
          max_tokens: MAX_TOKENS,
          messages: [{role: "user", content: prompt}],
          model: model
        )
        extract_content(message)
      rescue Anthropic::Errors::APIError => e
        raise ProviderError, e.message
      end

      private

      attr_reader :client, :model

      def extract_content(message)
        text_block = message.content.find { |block| block.type == :text }
        content = text_block&.text
        raise ProviderError, "Provider returned empty content" if blank?(content)

        content
      end

      def blank?(value)
        value.nil? || value.to_s.strip.empty?
      end
    end
  end
end
