# frozen_string_literal: true

require "spec_helper"
require "sequel"

DB_SBT_SPEC = Sequel.mock(host: "postgres")
DB_SBT_SPEC.extension(:pg_enum)
DB_SBT_SPEC.extension(:pg_json)

original_db = begin
  Sequel::Model.db
rescue
  nil
end
Sequel::Model.db = DB_SBT_SPEC

require "autodidact/models/source_blob_tag"
require "autodidact/models/source_blob"
require "autodidact/models/tag"

Sequel::Model.db = original_db if original_db

RSpec.describe Autodidact::Models::SourceBlobTag do
  describe "associations" do
    it "declares many_to_one :source_blob" do
      association = described_class.association_reflection(:source_blob)

      expect(association).not_to be_nil
      expect(association[:type]).to eq(:many_to_one)
    end

    it "declares many_to_one :tag" do
      association = described_class.association_reflection(:tag)

      expect(association).not_to be_nil
      expect(association[:type]).to eq(:many_to_one)
    end
  end
end
