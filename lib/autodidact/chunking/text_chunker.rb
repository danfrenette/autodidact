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
        success(payload: chunks.each_with_index.map do |chunk, idx|
          TextChunk.new(
            content: chunk.text,
            chunk_index: idx,
            token_count: chunk.token_count,
            chunk_id: chunk.chunk_id,
            byte_offset: chunk.byte_offset,
            byte_length: chunk.byte_length
          )
        end)
      end

      private

      attr_reader :raw_text

      def blank?
        raw_text.nil? || raw_text.strip.empty?
      end

      def splitter
        @splitter ||= Tomos::Markdown.new(model: MODEL, capacity: TARGET_TOKENS, overlap: OVERLAP_TOKENS)
      end
    end
  end
end
