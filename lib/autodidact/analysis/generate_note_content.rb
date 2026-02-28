# frozen_string_literal: true

module Autodidact
  module Analysis
    class GenerateNoteContent < Command
      def initialize(raw_text:)
        @raw_text = raw_text
      end

      def call
        content = client.chat(prompt: FixedPrompt.call(raw_text: raw_text))
        success(payload: content)
      rescue Provider::ProviderError => e
        failure(e)
      end

      private

      attr_reader :raw_text

      def client
        Provider::ClientFor.call(config: Autodidact.config)
      end
    end
  end
end
