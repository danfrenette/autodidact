# frozen_string_literal: true

require "spec_helper"
require "digest"

RSpec.describe Autodidact::Storage::LinkChunksToSource, :db do
  def create_blob(source_path: "notes/test.md")
    Autodidact::Models::SourceBlob.create(
      source_path: source_path,
      source_type: "text",
      selection_kind: "full",
      selection_payload: Sequel.pg_jsonb({}),
      raw_text: "some text"
    )
  end

  def create_chunk(content:)
    Autodidact::Models::SourceChunk.create(
      content: content,
      embedding: Array.new(1536, 0.0),
      token_count: 1,
      chunk_id: Digest::SHA256.hexdigest(content)
    )
  end

  describe ".call" do
    it "links existing chunks to a source blob in a single operation" do
      blob = create_blob
      chunk_a = create_chunk(content: "first chunk")
      chunk_b = create_chunk(content: "second chunk")

      result = described_class.call(
        source_blob_id: blob.id,
        chunk_mappings: [
          {chunk_id: chunk_a.chunk_id, chunk_index: 0},
          {chunk_id: chunk_b.chunk_id, chunk_index: 1}
        ]
      )

      expect(result).to be_success
      expect(result.payload).to eq(chunks_linked: 2)

      links = Autodidact::Models::SourceBlobChunk.where(source_blob_id: blob.id).all
      expect(links.size).to eq(2)
      expect(links.map(&:chunk_index).sort).to eq([0, 1])
    end

    it "returns zero when given no mappings" do
      result = described_class.call(
        source_blob_id: "00000000-0000-0000-0000-000000000000",
        chunk_mappings: []
      )

      expect(result).to be_success
      expect(result.payload).to eq(chunks_linked: 0)
    end
  end
end
