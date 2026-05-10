# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::Create, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }

  describe "#call" do
    it "creates a source with valid params" do
      result = described_class.call(
        user: current_user,
        source_params: {title: "Test Source", kind: "pdf"},
        selection_params: []
      )

      expect(result).to be_success
      expect(result.source).to be_persisted
      expect(result.source.title).to eq("Test Source")
      expect(result.source.status).to eq("uploading")
    end

    it "creates a source with selections" do
      selection_params = [
        {kind: "chapter", title: "Chapter 1", label: "01", position: {ordinal: 1}, locator: {type: "page_range", start: 1, end: 12}}
      ]

      result = described_class.call(
        user: current_user,
        source_params: {title: "Test Source"},
        selection_params: selection_params
      )

      expect(result).to be_success
      expect(result.source.source_selections.count).to eq(1)
      expect(result.source.source_selections.first.title).to eq("Chapter 1")
    end

    it "creates a source with tags" do
      result = described_class.call(
        user: current_user,
        source_params: {title: "Test Source"},
        selection_params: [],
        tag_names: ["Distributed Systems", "databases"]
      )

      expect(result).to be_success
      expect(result.source.tags.map(&:name)).to contain_exactly("distributed-systems", "databases")
      expect(result.source.taggings.map(&:taggable)).to all(eq(result.source))
    end

    it "returns failure when source params are invalid" do
      result = described_class.call(
        user: current_user,
        source_params: {title: ""},
        selection_params: []
      )

      expect(result).not_to be_success
      expect(result.errors).to include(/Title/)
    end

    it "returns failure when selection params are invalid" do
      result = described_class.call(
        user: current_user,
        source_params: {title: "Test Source"},
        selection_params: [{title: ""}]
      )

      expect(result).not_to be_success
      expect(Source.count).to eq(0)
    end
  end
end
