# frozen_string_literal: true

require "spec_helper"
require "digest"

RSpec.describe Autodidact::Retrieval::RelatedChunks, :db do
  let(:chunk_counter) { 0 }

  def create_blob(source_path: "notes/other.md", tags: [])
    blob = Autodidact::Models::SourceBlob.create(
      source_path: source_path,
      source_type: "text",
      selection_kind: "full",
      selection_payload: Sequel.pg_jsonb({}),
      raw_text: "some text"
    )
    tags.each do |name|
      tag = Autodidact::Models::Tag.find_or_create(name: name)
      blob.add_tag(tag)
    end
    blob
  end

  def create_chunk(blob, content:, chunk_index: 0, embedding: nil, token_count: 1)
    chunk_id = Digest::SHA256.hexdigest(content)

    chunk = Autodidact::Models::SourceChunk.create(
      content: content,
      embedding: embedding,
      token_count: token_count,
      chunk_id: chunk_id
    )

    Autodidact::Models::SourceBlobChunk.create(
      source_blob_id: blob.id,
      source_chunk_id: chunk.id,
      chunk_index: chunk_index
    )

    chunk
  end

  describe ".call" do
    it "returns an empty array when tags are blank" do
      blob = create_blob(tags: ["study-guide"])
      create_chunk(blob, content: "chunk", embedding: Array.new(1536, 0.1))

      result = described_class.call(source_blob_id: blob.id, tags: [])

      expect(result).to be_success
      expect(result.payload).to eq([])
    end

    it "returns an empty array when the source blob has no chunks" do
      blob = create_blob(tags: ["study-guide"])

      result = described_class.call(source_blob_id: blob.id, tags: ["study-guide"])

      expect(result).to be_success
      expect(result.payload).to eq([])
    end

    it "returns related chunks from other blobs sharing the same tags" do
      source_blob = create_blob(source_path: "notes/source.md", tags: ["study-guide"])
      create_chunk(source_blob, content: "source chunk", embedding: Array.new(1536, 0.1))

      other_blob = create_blob(source_path: "notes/other.md", tags: ["study-guide"])
      create_chunk(other_blob, content: "related chunk", chunk_index: 0, embedding: Array.new(1536, 0.2))

      result = described_class.call(source_blob_id: source_blob.id, tags: ["study-guide"])

      expect(result).to be_success
      expect(result.payload.map(&:content)).to include("related chunk")
      expect(result.payload.map(&:source_path)).to include("notes/other.md")
    end

    it "excludes chunks from the source blob itself" do
      blob = create_blob(source_path: "notes/source.md", tags: ["study-guide"])
      create_chunk(blob, content: "self chunk", embedding: Array.new(1536, 0.1))

      result = described_class.call(source_blob_id: blob.id, tags: ["study-guide"])

      expect(result).to be_success
      expect(result.payload).to eq([])
    end

    it "only returns chunks from blobs that share at least one tag" do
      source_blob = create_blob(source_path: "notes/source.md", tags: ["study-guide"])
      create_chunk(source_blob, content: "source chunk", embedding: Array.new(1536, 0.1))

      unrelated_blob = create_blob(source_path: "notes/unrelated.md", tags: ["other-tag"])
      create_chunk(unrelated_blob, content: "unrelated chunk", embedding: Array.new(1536, 0.2))

      result = described_class.call(source_blob_id: source_blob.id, tags: ["study-guide"])

      expect(result).to be_success
      expect(result.payload).to eq([])
    end

    it "deduplicates chunks shared across multiple sources" do
      source_blob = create_blob(source_path: "notes/source.md", tags: ["study-guide"])
      create_chunk(source_blob, content: "source chunk", embedding: Array.new(1536, 0.1))

      blob_a = create_blob(source_path: "notes/a.md", tags: ["study-guide"])
      shared_chunk = create_chunk(blob_a, content: "shared content", embedding: Array.new(1536, 0.2))

      blob_b = create_blob(source_path: "notes/b.md", tags: ["study-guide"])
      Autodidact::Models::SourceBlobChunk.create(
        source_blob_id: blob_b.id,
        source_chunk_id: shared_chunk.id,
        chunk_index: 0
      )

      result = described_class.call(source_blob_id: source_blob.id, tags: ["study-guide"])

      expect(result).to be_success
      matching = result.payload.select { |c| c.content == "shared content" }
      expect(matching.size).to eq(1)
    end
  end
end
