# frozen_string_literal: true

require "openai"

module Autodidact
  module Analysis
    class GenerateNoteContent
      def self.call(raw_text:)
        new(raw_text: raw_text).call
      end

      def initialize(raw_text:)
        @raw_text = raw_text
      end

      def call
        response = client.chat(parameters: request_parameters)
        validate_content!(response.dig("choices", 0, "message", "content"))
      rescue => e
        raise StandardError, "OpenAI analysis failed: #{e.message}"
      end

      private

      attr_reader :raw_text

      def request_parameters
        {
          model: Autodidact.config.openai_model,
          messages: [{role: "user", content: FixedPrompt.call(raw_text: raw_text)}]
        }
      end

      def client
        OpenAI::Client.new(access_token: Autodidact.config.openai_access_token)
      end

      def validate_content!(content)
        raise StandardError, "OpenAI returned empty content" if content.nil? || content.strip.empty?

        content
      end
    end
  end
end
