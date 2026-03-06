# frozen_string_literal: true

require "tomos"

module Autodidact
  module Analysis
    class TokenCounter < Query
      MODEL = "gpt-4"
      SINGLE_CHUNK_CAPACITY = 10_000_000

      def initialize(text:)
        @text = text
      end

      def call
        return success(payload: 0) if text.nil? || text.strip.empty?

        chunk = splitter.chunks(text).first
        success(payload: chunk.token_count)
      end

      private

      attr_reader :text

      def splitter
        @splitter ||= Tomos::Text.new(model: MODEL, capacity: SINGLE_CHUNK_CAPACITY)
      end
    end
  end
end
