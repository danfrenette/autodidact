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
        new_chunks, existing_chunks = partition_by_existence(chunks)
        embeddings = generate_embeddings(new_chunks)
        insert_new_chunks(new_chunks, embeddings)
        link_all_chunks(chunks)

        success(payload: {chunks_created: new_chunks.size, chunks_reused: existing_chunks.size})
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

      def partition_by_existence(chunks)
        chunk_ids = chunks.map(&:chunk_id)
        existing_ids = Models::SourceChunk
          .where(chunk_id: chunk_ids)
          .select_map(:chunk_id)
          .to_set

        chunks.partition { |chunk| !existing_ids.include?(chunk.chunk_id) }
      end

      def generate_embeddings(chunks)
        return [] if chunks.empty?

        if Autodidact.config.embedding_provider == "dev"
          return Array.new(chunks.size) { Array.new(Provider::EMBEDDING_DIMENSIONS, 0.0) }
        end

        texts = chunks.map(&:content)
        result = Provider::GenerateBatchEmbeddings.call(texts: texts)
        raise result.error[:message] if result.failure?

        result.payload
      end

      def insert_new_chunks(chunks, embeddings)
        chunks.each_with_index do |chunk, idx|
          Models::SourceChunk.create(
            content: chunk.content,
            embedding: embeddings[idx],
            token_count: chunk.token_count,
            chunk_id: chunk.chunk_id
          )
        end
      end

      def link_all_chunks(chunks)
        mappings = chunks.map { |c| {chunk_id: c.chunk_id, chunk_index: c.chunk_index} }

        result = LinkChunksToSource.call(
          source_blob_id: source_blob_id,
          chunk_mappings: mappings
        )
        raise result.error[:message] if result.failure?
      end
    end
  end
end
