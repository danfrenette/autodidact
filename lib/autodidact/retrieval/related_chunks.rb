# frozen_string_literal: true

require "sequel"

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
            "SELECT avg(embedding)::vector AS centroid FROM source_chunks WHERE source_blob_id = ?::uuid",
            source_blob_id
          )
          .get(:centroid)
      end

      def candidate_chunks(centroid)
        Autodidact::DB.connection[:source_chunks]
          .join(:source_blobs, id: :source_blob_id)
          .join(:source_blob_tags, source_blob_id: Sequel[:source_blobs][:id])
          .join(:tags, id: Sequel[:source_blob_tags][:tag_id])
          .where(Sequel[:tags][:name] => tags)
          .exclude(Sequel[:source_chunks][:source_blob_id] => source_blob_id)
          .select(
            Sequel[:source_chunks][:content],
            Sequel[:source_chunks][:chunk_index],
            Sequel[:source_chunks][:token_count],
            Sequel[:source_blobs][:source_path],
            Sequel.lit("source_chunks.embedding <=> ? AS distance", centroid)
          )
          .distinct
          .order(Sequel.lit("distance"))
          .limit(limit)
          .all
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
