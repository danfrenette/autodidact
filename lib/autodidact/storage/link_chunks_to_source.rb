# frozen_string_literal: true

module Autodidact
  module Storage
    class LinkChunksToSource < Command
      def initialize(source_blob_id:, chunk_mappings:)
        @source_blob_id = source_blob_id
        @chunk_mappings = chunk_mappings
      end

      def call
        return success(payload: {chunks_linked: 0}) if chunk_mappings.empty?

        linked = insert_links
        success(payload: {chunks_linked: linked})
      rescue Sequel::Error => e
        failure(e)
      end

      private

      attr_reader :source_blob_id, :chunk_mappings

      def insert_links
        values_sql = chunk_mappings.map { |m|
          "(#{db.literal(m[:chunk_id])}, #{db.literal(m[:chunk_index])})"
        }.join(", ")

        db.run(<<~SQL)
          INSERT INTO source_blob_chunks (source_blob_id, source_chunk_id, chunk_index)
          SELECT #{db.literal(source_blob_id)}::uuid, sc.id, vals.chunk_index
          FROM source_chunks sc
          JOIN (VALUES #{values_sql}) AS vals(chunk_id, chunk_index)
            ON sc.chunk_id = vals.chunk_id
        SQL

        chunk_mappings.size
      end

      def db
        Autodidact::DB.connection
      end
    end
  end
end
