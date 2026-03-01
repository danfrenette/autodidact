# frozen_string_literal: true

require "spec_helper"
require "sequel"

DB_SB_SPEC = Sequel.mock(host: "postgres")
DB_SB_SPEC.extension(:pg_enum)
DB_SB_SPEC.extension(:pg_json)

original_db = begin
  Sequel::Model.db
rescue
  nil
end
Sequel::Model.db = DB_SB_SPEC

require "autodidact/models/source_blob"
require "autodidact/models/tag"
require "autodidact/models/source_blob_tag"

Sequel::Model.db = original_db if original_db

RSpec.describe Autodidact::Models::SourceBlob do
  describe "associations" do
    it "declares many_to_many :tags" do
      association = described_class.association_reflection(:tags)

      expect(association).not_to be_nil
      expect(association[:type]).to eq(:many_to_many)
      expect(association[:join_table]).to eq(:source_blob_tags)
    end
  end
end
