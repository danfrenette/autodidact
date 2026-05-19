# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::Create, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }

  describe "#call" do
    let(:attach_result) { instance_double(Sources::AttachAsset::Result, failure?: false) }
    let(:process_result) { instance_double(Sources::ProcessSelections::Result, failure?: false) }

    before do
      allow(Sources::AttachAsset).to receive(:call).and_return(attach_result)
      allow(Sources::ProcessSelections).to receive(:call).and_return(process_result)
    end

    it "creates a source with valid params" do
      result = described_class.call(
        user: current_user,
        source_params: {title: "Test Source", kind: "pdf"},
        selection_params: [],
        signed_blob_id: "signed-blob-id"
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
        selection_params: selection_params,
        signed_blob_id: "signed-blob-id"
      )

      expect(result).to be_success
      expect(result.source.source_selections.count).to eq(1)
      expect(result.source.source_selections.first.title).to eq("Chapter 1")
    end

    it "creates tags on selections" do
      selection_params = [
        {
          kind: "chapter",
          title: "Chapter 1",
          label: "01",
          position: {ordinal: 1},
          locator: {type: "page_range", start: 1, end: 12},
          tags: ["Distributed Systems", "Databases"]
        }
      ]

      result = described_class.call(
        user: current_user,
        source_params: {title: "Test Source"},
        selection_params: selection_params,
        signed_blob_id: "signed-blob-id"
      )

      selection = result.source.source_selections.first

      expect(result).to be_success
      expect(selection.tags.map(&:name)).to contain_exactly("distributed-systems", "databases")
      expect(selection.taggings.map(&:taggable)).to all(eq(selection))
    end

    it "creates a source with tags" do
      result = described_class.call(
        user: current_user,
        source_params: {title: "Test Source"},
        selection_params: [],
        tag_names: ["Distributed Systems", "databases"],
        signed_blob_id: "signed-blob-id"
      )

      expect(result).to be_success
      expect(result.source.tags.map(&:name)).to contain_exactly("distributed-systems", "databases")
      expect(result.source.taggings.map(&:taggable)).to all(eq(result.source))
    end

    it "attaches and processes the source when a signed blob id is provided" do
      source_params = {title: "Test Source", kind: "pdf"}
      selection_params = [
        {kind: "chapter", title: "Chapter 1", label: "01", position: {ordinal: 1}, locator: {type: "page_range", start: 1, end: 12}}
      ]
      result = described_class.call(
        user: current_user,
        source_params: source_params,
        selection_params: selection_params,
        signed_blob_id: "signed-blob-id"
      )

      expect(result).to be_success
      expect(Sources::AttachAsset).to have_received(:call).with(source: result.source, signed_blob_id: "signed-blob-id")
      expect(Sources::ProcessSelections).to have_received(:call).with(source: result.source)
    end

    it "returns failure when source params are invalid" do
      result = described_class.call(
        user: current_user,
        source_params: {title: ""},
        selection_params: [],
        signed_blob_id: "signed-blob-id"
      )

      expect(result).not_to be_success
      expect(result.errors).to include(/Title/)
    end

    it "returns failure when selection params are invalid" do
      result = described_class.call(
        user: current_user,
        source_params: {title: "Test Source"},
        selection_params: [{title: ""}],
        signed_blob_id: "signed-blob-id"
      )

      expect(result).not_to be_success
      expect(Source.count).to eq(0)
    end
  end
end
