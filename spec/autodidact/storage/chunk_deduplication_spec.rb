# frozen_string_literal: true

require "spec_helper"

RSpec.describe "Chunk deduplication", :db do
  let(:dev_config) { instance_double(Autodidact::Configuration, embedding_provider: "dev") }

  before { allow(Autodidact).to receive(:config).and_return(dev_config) }

  def source_chunks
    Autodidact::Models::SourceChunk
  end

  def blob_chunks
    Autodidact::Models::SourceBlobChunk
  end

  def create_blob(source_path:)
    Autodidact::Models::SourceBlob.create(
      source_path: source_path,
      source_type: "text",
      selection_kind: "full",
      selection_payload: Sequel.pg_jsonb({}),
      raw_text: "placeholder"
    )
  end

  def persist_chunks(blob_id:, raw_text:)
    Autodidact::Storage::PersistSourceChunks.call(
      source_blob_id: blob_id,
      raw_text: raw_text
    )
  end

  it "creates chunks and links on first ingest" do
    blob = create_blob(source_path: "notes/first.md")
    result = persist_chunks(blob_id: blob.id, raw_text: "Hello world. This is a test.")

    expect(result).to be_success
    expect(result.payload[:chunks_created]).to be >= 1
    expect(result.payload[:chunks_reused]).to eq(0)
    expect(source_chunks.count).to eq(result.payload[:chunks_created])
    expect(blob_chunks.where(source_blob_id: blob.id).count).to eq(result.payload[:chunks_created])
  end

  it "reuses all chunks when the same text is ingested again" do
    blob_a = create_blob(source_path: "notes/first.md")
    first_result = persist_chunks(blob_id: blob_a.id, raw_text: "Hello world. This is a test.")
    chunks_after_first = source_chunks.count

    blob_b = create_blob(source_path: "notes/second.md")
    second_result = persist_chunks(blob_id: blob_b.id, raw_text: "Hello world. This is a test.")

    expect(second_result).to be_success
    expect(second_result.payload[:chunks_reused]).to eq(first_result.payload[:chunks_created])
    expect(second_result.payload[:chunks_created]).to eq(0)
    expect(source_chunks.count).to eq(chunks_after_first)
    expect(blob_chunks.where(source_blob_id: blob_a.id).count).to eq(first_result.payload[:chunks_created])
    expect(blob_chunks.where(source_blob_id: blob_b.id).count).to eq(first_result.payload[:chunks_created])
  end

  it "creates only new chunks when text partially overlaps" do
    shared_text = "# Shared Section\n\n" + ("The quick brown fox jumps over the lazy dog. " * 50)
    unique_a = "# Unique to A\n\n" + ("Alpha content fills this section with detail. " * 50)
    unique_b = "# Unique to B\n\n" + ("Bravo content fills this section with detail. " * 50)

    blob_a = create_blob(source_path: "notes/a.md")
    first_result = persist_chunks(blob_id: blob_a.id, raw_text: shared_text + unique_a)
    chunks_after_first = source_chunks.count

    blob_b = create_blob(source_path: "notes/b.md")
    second_result = persist_chunks(blob_id: blob_b.id, raw_text: shared_text + unique_b)

    expect(second_result).to be_success
    expect(second_result.payload[:chunks_reused]).to be >= 1
    expect(second_result.payload[:chunks_created]).to be >= 1
    total_second = second_result.payload[:chunks_created] + second_result.payload[:chunks_reused]
    expect(source_chunks.count).to eq(chunks_after_first + second_result.payload[:chunks_created])
    expect(blob_chunks.where(source_blob_id: blob_a.id).count).to eq(first_result.payload[:chunks_created])
    expect(blob_chunks.where(source_blob_id: blob_b.id).count).to eq(total_second)
  end
end
