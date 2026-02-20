# frozen_string_literal: true

module Autodidact
  module Analysis
    class GenerateNoteContent
      class ProviderError < StandardError; end

      def self.call(raw_text:)
        new(raw_text: raw_text).call
      end

      def initialize(raw_text:)
        @raw_text = raw_text
      end

      def call
        client.chat(prompt: FixedPrompt.call(raw_text: raw_text))
      rescue => e
        raise ProviderError, "Provider analysis failed: #{e.message}"
      end

      private

      attr_reader :raw_text

      def client
        Provider::ClientFor.call(config: Autodidact.config)
      end
    end
  end
end
