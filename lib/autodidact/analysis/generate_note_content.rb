# frozen_string_literal: true

module Autodidact
  module Analysis
    class GenerateNoteContent < Command
      class ProviderError < StandardError; end

      def initialize(raw_text:)
        @raw_text = raw_text
      end

      def call
        content = client.chat(prompt: FixedPrompt.call(raw_text: raw_text))
        success(payload: content)
      rescue ProviderError => e
        failure(e)
      end

      private

      attr_reader :raw_text

      def client
        result = Provider::ClientFor.call(config: Autodidact.config)
        raise ProviderError, result.error[:message] if result.failure?

        result.payload
      end
    end
  end
end
