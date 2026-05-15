# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::RetrieveRelatedChunks, type: :service do
  let_it_be(:user, refind: true) { create(:user, id: "user_123") }

  let(:tag) { create(:tag, user: user, name: "databases") }
  let(:source) { create(:source, user: user) }
  let(:selection) { create(:source_selection, source: source) }
  let(:content) { create(:source_selection_content, source_selection: selection) }
  let(:current_chunk) do
    create(:source_chunk, source_selection_content: content, embedding: embedding(1.0), chunk_id: "current")
  end

  subject(:result) { described_class.call(source_selection: selection, source_chunks: [current_chunk]) }

  describe ".call" do
    it "uses source tags when the selection has no tags" do
      create(:tagging, tag: tag, taggable: source)
      related_chunk = create_related_chunk(tag: tag, embedding: embedding(0.9), chunk_id: "related")

      expect(result).to be_success
      expect(result.chunks).to eq([related_chunk])
    end

    it "prefers selection tags over source tags" do
      source_tag = create(:tag, user: user, name: "source-tag")
      selection_tag = create(:tag, user: user, name: "selection-tag")
      create(:tagging, tag: source_tag, taggable: source)
      create(:tagging, tag: selection_tag, taggable: selection)
      create_related_chunk(tag: source_tag, embedding: embedding(0.9), chunk_id: "source-related")
      selection_related_chunk = create_related_chunk(tag: selection_tag, embedding: embedding(0.8), chunk_id: "selection-related")

      expect(result).to be_success
      expect(result.chunks).to eq([selection_related_chunk])
    end

    it "excludes chunks from the current selection" do
      create(:tagging, tag: tag, taggable: selection)

      expect(result).to be_success
      expect(result.chunks).to be_empty
    end

    it "caps results per related source" do
      create(:tagging, tag: tag, taggable: source)
      related_source = create(:source, user: user)
      related_selection = create(:source_selection, source: related_source)
      create(:tagging, tag: tag, taggable: related_selection)
      related_content = create(:source_selection_content, source_selection: related_selection)
      4.times do |index|
        create(:source_chunk, source_selection_content: related_content, chunk_index: index, embedding: embedding(0.9 - (index * 0.01)), chunk_id: "related-#{index}")
      end

      expect(result).to be_success
      expect(result.chunks.size).to eq(3)
    end
  end

  def create_related_chunk(tag:, embedding:, chunk_id:)
    related_source = create(:source, user: user)
    related_selection = create(:source_selection, source: related_source)
    related_content = create(:source_selection_content, source_selection: related_selection)
    create(:tagging, tag: tag, taggable: related_selection)
    create(:source_chunk, source_selection_content: related_content, embedding: embedding, chunk_id: chunk_id)
  end

  def embedding(value)
    Array.new(1536, value)
  end
end
