# frozen_string_literal: true

module Autodidact
  module Chunking
    class TextChunker < Query
      TARGET_TOKENS = 500
      OVERLAP_TOKENS = 50
      CHARS_PER_TOKEN = 4

      def initialize(raw_text:)
        @raw_text = raw_text
      end

      def call
        return success(payload: []) if blank?

        paragraphs = split_into_paragraphs(raw_text)
        segments = merge_into_segments(paragraphs)
        success(payload: build_chunks(segments))
      end

      private

      attr_reader :raw_text

      def blank?
        raw_text.nil? || raw_text.strip.empty?
      end

      def split_into_paragraphs(text)
        text.split(/\n{2,}/).map(&:strip).reject(&:empty?)
      end

      def merge_into_segments(paragraphs)
        paragraphs.each_with_object([+""]) do |para, segments|
          if segments.last.empty?
            segments.last << para
          elsif fits_in_segment?(segments.last, para)
            segments.last << "\n\n" << para
          else
            segments << +para
          end
        end
      end

      def fits_in_segment?(segment, paragraph)
        token_count(segment) + token_count(paragraph) <= TARGET_TOKENS
      end

      def build_chunks(segments)
        chunks = []
        overlap_text = +""

        segments.each_with_index do |segment, idx|
          content = idx.zero? ? segment : combine_overlap(overlap_text, segment)
          chunks << TextChunk.new(content: content, chunk_index: idx)
          overlap_text = extract_overlap(segment)
        end

        chunks
      end

      def combine_overlap(overlap, segment)
        return segment if overlap.empty?

        "#{overlap}\n\n#{segment}"
      end

      def extract_overlap(text)
        target_chars = OVERLAP_TOKENS * CHARS_PER_TOKEN
        return text if text.length <= target_chars

        tail = text[-target_chars..]
        boundary = tail.index(/[.!?]\s/)
        boundary ? tail[(boundary + 2)..] : tail
      end

      def token_count(text)
        (text.length.to_f / CHARS_PER_TOKEN).ceil
      end
    end
  end
end
