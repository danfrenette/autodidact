# frozen_string_literal: true

require "sequel"

module Autodidact
  module Models
    class Tag < ::Sequel::Model(:tags)
      plugin :validation_helpers
      plugin :timestamps, update_on_create: true

      many_to_many :source_blobs, join_table: :source_blob_tags

      def validate
        super
        validates_presence :name
        validates_unique :name
      end
    end
  end
end
