# frozen_string_literal: true

require "sequel"

module Autodidact
  module Models
    class SourceChunk < ::Sequel::Model(:source_chunks)
      plugin :timestamps, update_on_create: true
      plugin :pgvector, :embedding

      many_to_one :source_blob
    end
  end
end
