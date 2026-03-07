# frozen_string_literal: true

require "spec_helper"

Sequel::Model.db = DB_TEST
require "autodidact/models/source_blob_tag"
require "autodidact/models/source_blob"
require "autodidact/models/tag"

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
