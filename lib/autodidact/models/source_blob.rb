# frozen_string_literal: true

require "sequel"

module Autodidact
  module Models
    class SourceBlob < ::Sequel::Model(:source_blobs)
      plugin :validation_helpers
      plugin :timestamps, update_on_create: true

      many_to_many :tags, join_table: :source_blob_tags
      one_to_many :source_chunks

      def validate
        super
        validates_presence %i[source_path source_type selection_kind raw_text]
      end
    end
  end
end
