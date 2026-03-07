# frozen_string_literal: true

require "sequel"
Sequel.extension(:pg_array)

module Autodidact
  module Retrieval
    class RelatedChunks < Query
      DEFAULT_LIMIT = 20

      def initialize(source_blob_id:, tags:, limit: DEFAULT_LIMIT)
        @source_blob_id = source_blob_id
        @tags = Array(tags)
        @limit = limit
      end

      def call
        chunks = fetch_chunks
        success(payload: chunks)
      rescue Sequel::Error => e
        failure(e)
      end

      private

      attr_reader :source_blob_id, :tags, :limit

      def fetch_chunks
        return [] if tags.empty?

        centroid = source_centroid
        return [] if centroid.nil?

        candidate_chunks(centroid)
          .map { |row| build_retrieved_chunk(row) }
      end

      def source_centroid
        Autodidact::DB.connection
          .fetch(
            <<~SQL,
              SELECT avg(sc.embedding)::vector AS centroid
              FROM source_chunks sc
              JOIN source_blob_chunks sbc ON sbc.source_chunk_id = sc.id
              WHERE sbc.source_blob_id = ?::uuid
            SQL
            source_blob_id
          )
          .get(:centroid)
      end

      def candidate_chunks(centroid)
        Autodidact::DB.connection.fetch(
          <<~SQL,
            SELECT content, chunk_index, token_count, source_path, distance
            FROM (
              SELECT DISTINCT ON (sc.chunk_id)
                sc.content,
                sbc.chunk_index,
                sc.token_count,
                sb.source_path,
                sc.embedding <=> ? AS distance
              FROM source_chunks sc
              JOIN source_blob_chunks sbc ON sbc.source_chunk_id = sc.id
              JOIN source_blobs sb ON sb.id = sbc.source_blob_id
              JOIN source_blob_tags sbt ON sbt.source_blob_id = sb.id
              JOIN tags t ON t.id = sbt.tag_id
              WHERE t.name = ANY(?::text[])
                AND sbc.source_blob_id != ?::uuid
              ORDER BY sc.chunk_id, distance
            ) deduped
            ORDER BY distance
            LIMIT ?
          SQL
          centroid,
          Sequel.pg_array(tags),
          source_blob_id,
          limit
        ).all
      end

      def build_retrieved_chunk(row)
        RetrievedChunk.new(
          content: row[:content],
          chunk_index: row[:chunk_index],
          source_path: row[:source_path],
          token_count: row[:token_count]
        )
      end
    end
  end
end
