# frozen_string_literal: true

require "sequel"
require "pgvector"

module Autodidact
  module Models
    class SourceChunk < ::Sequel::Model(:source_chunks)
      plugin :timestamps, update_on_create: true
      plugin :pgvector, :embedding

      many_to_one :source_blob

      def embedding=(value)
        if value.nil?
          @values[:embedding] = nil
        else
          self[:embedding] = value
        end
      end
    end
  end
end
