# frozen_string_literal: true

require "sequel"

module Autodidact
  module Models
    class SourceBlobTag < ::Sequel::Model(:source_blob_tags)
      plugin :timestamps, update_on_create: true

      many_to_one :source_blob
      many_to_one :tag
    end
  end
end
