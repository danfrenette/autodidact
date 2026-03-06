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
        embeddings = generate_embeddings(chunks)
        insert_chunks(chunks, embeddings)
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

      def generate_embeddings(chunks)
        if Autodidact.config.embedding_provider == "dev"
          return Array.new(chunks.size) { Array.new(Provider::EMBEDDING_DIMENSIONS, 0.0) }
        end

        texts = chunks.map(&:content)
        result = Provider::GenerateBatchEmbeddings.call(texts: texts)
        raise result.error[:message] if result.failure?

        result.payload
      end

      def insert_chunks(chunks, embeddings)
        chunks.each_with_index do |chunk, idx|
          Models::SourceChunk.create(
            source_blob_id: source_blob_id,
            chunk_index: chunk.chunk_index,
            content: chunk.content,
            embedding: embeddings[idx],
            token_count: chunk.token_count,
            chunk_id: chunk.chunk_id
          )
        end
      end
    end
  end
end
