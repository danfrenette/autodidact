# frozen_string_literal: true

module Autodidact
  module Models
    class SourceBlob < Sequel::Model(:source_blobs)
      plugin :validation_helpers
      plugin :timestamps, update_on_create: true

      def validate
        super
        validates_presence %i[source_path source_type selection_kind raw_text]
      end
    end
  end
end
