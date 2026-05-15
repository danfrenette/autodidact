# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::ChunkContent, type: :service do
  let(:chunk_class) { Data.define(:text, :token_count, :byte_offset, :byte_length, :chunk_id) }

  describe ".call" do
    it "persists chunks produced by the splitter" do
      content = create(:source_selection_content, raw_text: "One. Two.")
      splitter = double(chunks: [chunk_class.new("One.", 2, 0, 4, "chunk-one")])

      result = described_class.call(source_selection_content: content, splitter: splitter)

      expect(result).to be_success
      expect(result.chunks.size).to eq(1)
      expect(content.source_chunks.reload.first).to have_attributes(
        content: "One.",
        token_count: 2,
        byte_offset: 0,
        byte_length: 4,
        chunk_id: "chunk-one"
      )
    end

    it "replaces existing chunks when reprocessing" do
      content = create(:source_selection_content, raw_text: "New text.")
      create(:source_chunk, source_selection_content: content, chunk_id: "old")
      splitter = double(chunks: [chunk_class.new("New text.", 3, 0, 9, "new")])

      result = described_class.call(source_selection_content: content, splitter: splitter)

      expect(result).to be_success
      expect(content.source_chunks.reload.pluck(:chunk_id)).to eq(["new"])
    end
  end
end
