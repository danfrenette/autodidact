# frozen_string_literal: true

require "sequel"

module Autodidact
  module Models
    class SourceBlobChunk < ::Sequel::Model(:source_blob_chunks)
      many_to_one :source_blob
      many_to_one :source_chunk
    end
  end
end
