# frozen_string_literal: true

require "tomos"

module Autodidact
  module Analysis
    class TokenCounter < Query
      MODEL = "gpt-4"

      def initialize(text:)
        @text = text
      end

      def call
        return success(payload: 0) if text.nil? || text.strip.empty?

        success(payload: Tomos::Text.count_tokens(text, model: MODEL))
      end

      private

      attr_reader :text
    end
  end
end
