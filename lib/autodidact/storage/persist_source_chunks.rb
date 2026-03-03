# frozen_string_literal: true

module Autodidact
  module Storage
    class PersistSourceChunks < Command
      def initialize(source_blob_id:, raw_text:)
        @source_blob_id = source_blob_id
        @raw_text = raw_text
      end

      def call
        chunks = chunk_text
        insert_chunks(chunks)
        success(payload: {chunks_created: chunks.size})
      rescue Sequel::Error => e
        failure(e)
      end

      private

      attr_reader :source_blob_id, :raw_text

      def chunk_text
        result = Chunking::TextChunker.call(raw_text: raw_text)
        raise result.error[:message] if result.failure?

        result.payload
      end

      def insert_chunks(chunks)
        chunks.each { |chunk| persist_chunk(chunk) }
      end

      def persist_chunk(chunk)
        Models::SourceChunk.create(
          source_blob_id: source_blob_id,
          chunk_index: chunk.chunk_index,
          content: chunk.content,
          embedding: generate_embedding(chunk.content)
        )
      end

      def generate_embedding(text)
        return if Autodidact.config.embedding_provider == "dev"

        result = Provider::GenerateEmbedding.call(text: text)
        raise result.error[:message] if result.failure?

        result.payload
      end
    end
  end
end
