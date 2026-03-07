# frozen_string_literal: true

require "sequel"
require "pgvector"

module Autodidact
  module Models
    class SourceChunk < ::Sequel::Model(:source_chunks)
      plugin :timestamps, update_on_create: true
      plugin :pgvector, :embedding

      one_to_many :source_blob_chunks
      many_to_many :source_blobs, join_table: :source_blob_chunks

      def embedding=(value)
        self[:embedding] = value
      end
    end
  end
end
