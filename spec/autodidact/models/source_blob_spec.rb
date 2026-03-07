# frozen_string_literal: true

require "spec_helper"

Sequel::Model.db = DB_TEST
require "autodidact/models/source_blob"
require "autodidact/models/tag"
require "autodidact/models/source_blob_tag"

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
