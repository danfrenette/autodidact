# frozen_string_literal: true

module Sources
  class ChunkContent < ApplicationService
    Result = ApplicationResult.define(:chunks, :error_message)

    DEFAULT_CAPACITY = 500
    DEFAULT_OVERLAP = 50
    MODEL = "gpt-4"

    def initialize(source_selection_content:, splitter: default_splitter)
      @source_selection_content = source_selection_content
      @splitter = splitter
    end

    def call
      source_selection_content.source_chunks.destroy_all
      success(chunks: tomos_chunks.each_with_index.map { |chunk, index| persist(chunk, index) }, error_message: nil)
    rescue => e
      failure(chunks: nil, error_message: e.message)
    end

    private

    attr_reader :source_selection_content, :splitter

    def text
      source_selection_content.raw_text
    end

    def tomos_chunks
      return [] if text.blank?

      splitter.chunks(text)
    end

    def persist(chunk, index)
      SourceChunk.create!(
        source_selection_content: source_selection_content,
        chunk_index: index,
        content: chunk.text,
        token_count: chunk.token_count,
        byte_offset: chunk.byte_offset,
        byte_length: chunk.byte_length,
        chunk_id: chunk.chunk_id
      )
    end

    def default_splitter
      Tomos::Markdown.new(model: MODEL, capacity: DEFAULT_CAPACITY, overlap: DEFAULT_OVERLAP)
    end
  end
end
