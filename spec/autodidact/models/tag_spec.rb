# frozen_string_literal: true

require "spec_helper"
require "sequel"

DB_TAG_SPEC = Sequel.mock(host: "postgres")
DB_TAG_SPEC.extension(:pg_enum)
DB_TAG_SPEC.extension(:pg_json)

# Temporarily set the model db so models can load their table schemas
original_db = begin
  Sequel::Model.db
rescue
  nil
end
Sequel::Model.db = DB_TAG_SPEC

require "autodidact/models/tag"
require "autodidact/models/source_blob"
require "autodidact/models/source_blob_tag"

Sequel::Model.db = original_db if original_db

RSpec.describe Autodidact::Models::Tag do
  describe "associations" do
    it "declares many_to_many :source_blobs" do
      association = described_class.association_reflection(:source_blobs)

      expect(association).not_to be_nil
      expect(association[:type]).to eq(:many_to_many)
      expect(association[:join_table]).to eq(:source_blob_tags)
    end
  end
end
