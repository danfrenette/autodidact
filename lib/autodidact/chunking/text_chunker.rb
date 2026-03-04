# frozen_string_literal: true

require "tomos"

module Autodidact
  module Chunking
    class TextChunker < Query
      TARGET_TOKENS = 500
      OVERLAP_TOKENS = 50
      MODEL = "gpt-4"

      def initialize(raw_text:)
        @raw_text = raw_text
      end

      def call
        return success(payload: []) if blank?

        chunks = splitter.chunks(raw_text)
        success(payload: chunks.each_with_index.map do |content, idx|
          TextChunk.new(content: content, chunk_index: idx)
        end)
      end

      private

      attr_reader :raw_text

      def blank?
        raw_text.nil? || raw_text.strip.empty?
      end

      def splitter
        @splitter ||= Tomos::Markdown.new(MODEL, TARGET_TOKENS, OVERLAP_TOKENS)
      end
    end
  end
end
