# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Storage::PersistSourceChunks do
  let(:chunk_a) do
    Autodidact::TextChunk.new(
      content: "chunk one", chunk_index: 0,
      token_count: 2, chunk_id: "abc123", byte_offset: 0, byte_length: 9
    )
  end
  let(:chunk_b) do
    Autodidact::TextChunk.new(
      content: "chunk two", chunk_index: 1,
      token_count: 2, chunk_id: "def456", byte_offset: 10, byte_length: 9
    )
  end
  let(:embedding_a) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:embedding_b) { Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS) { rand } }
  let(:chunk_query) { instance_double(Sequel::Dataset) }

  before do
    allow(Autodidact::Chunking::TextChunker).to receive(:call)
      .and_return(success_result([chunk_a, chunk_b]))
    allow(Autodidact::Models::SourceChunk).to receive(:create)
    allow(Autodidact::Models::SourceChunk).to receive(:where).and_return(chunk_query)
    allow(Autodidact::Storage::LinkChunksToSource).to receive(:call)
      .and_return(success_result({chunks_linked: 2}))
  end

  describe ".call" do
    context "when all chunks are new" do
      before do
        allow(chunk_query).to receive(:select_map).with(:chunk_id).and_return([])
      end

      context "when embedding_provider is dev" do
        let(:config) { instance_double(Autodidact::Configuration, embedding_provider: "dev") }

        before { allow(Autodidact).to receive(:config).and_return(config) }

        it "persists chunks with zero-vector embeddings and links them" do
          allow(Autodidact::Provider::GenerateBatchEmbeddings).to receive(:call)
          zero_vector = Array.new(Autodidact::Provider::EMBEDDING_DIMENSIONS, 0.0)

          result = described_class.call(source_blob_id: "blob-1", raw_text: "raw text")

          expect(result).to be_success
          expect(result.payload).to eq(chunks_created: 2, chunks_reused: 0)
          expect(Autodidact::Provider::GenerateBatchEmbeddings).not_to have_received(:call)
          expect(Autodidact::Models::SourceChunk).to have_received(:create).with(
            hash_including(embedding: zero_vector)
          ).twice
          expect(Autodidact::Storage::LinkChunksToSource).to have_received(:call).with(
            source_blob_id: "blob-1",
            chunk_mappings: [
              {chunk_id: "abc123", chunk_index: 0},
              {chunk_id: "def456", chunk_index: 1}
            ]
          )
        end
      end

      context "when embedding_provider is openai" do
        let(:config) { instance_double(Autodidact::Configuration, embedding_provider: "openai") }

        before { allow(Autodidact).to receive(:config).and_return(config) }

        it "generates all embeddings in one batch call and links them" do
          allow(Autodidact::Provider::GenerateBatchEmbeddings).to receive(:call)
            .with(texts: ["chunk one", "chunk two"])
            .and_return(success_result([embedding_a, embedding_b]))

          result = described_class.call(source_blob_id: "blob-1", raw_text: "raw text")

          expect(result).to be_success
          expect(result.payload).to eq(chunks_created: 2, chunks_reused: 0)
          expect(Autodidact::Provider::GenerateBatchEmbeddings).to have_received(:call).once
          expect(Autodidact::Models::SourceChunk).to have_received(:create).with(
            hash_including(content: "chunk one", embedding: embedding_a, token_count: 2, chunk_id: "abc123")
          )
          expect(Autodidact::Models::SourceChunk).to have_received(:create).with(
            hash_including(content: "chunk two", embedding: embedding_b, token_count: 2, chunk_id: "def456")
          )
        end

        it "returns failure when the batch embedding call fails" do
          allow(Autodidact::Provider::GenerateBatchEmbeddings).to receive(:call)
            .and_return(error_result("Batch embedding response was empty"))

          expect(described_class.call(source_blob_id: "blob-1", raw_text: "raw text")).to be_failure
        end
      end
    end

    context "when all chunks already exist" do
      let(:config) { instance_double(Autodidact::Configuration, embedding_provider: "openai") }

      before do
        allow(Autodidact).to receive(:config).and_return(config)
        allow(chunk_query).to receive(:select_map).with(:chunk_id).and_return(["abc123", "def456"])
      end

      it "skips embedding generation and links existing chunks" do
        allow(Autodidact::Provider::GenerateBatchEmbeddings).to receive(:call)

        result = described_class.call(source_blob_id: "blob-1", raw_text: "raw text")

        expect(result).to be_success
        expect(result.payload).to eq(chunks_created: 0, chunks_reused: 2)
        expect(Autodidact::Provider::GenerateBatchEmbeddings).not_to have_received(:call)
        expect(Autodidact::Models::SourceChunk).not_to have_received(:create)
        expect(Autodidact::Storage::LinkChunksToSource).to have_received(:call).with(
          source_blob_id: "blob-1",
          chunk_mappings: [
            {chunk_id: "abc123", chunk_index: 0},
            {chunk_id: "def456", chunk_index: 1}
          ]
        )
      end
    end

    context "when some chunks are new and some already exist" do
      let(:config) { instance_double(Autodidact::Configuration, embedding_provider: "openai") }

      before do
        allow(Autodidact).to receive(:config).and_return(config)
        allow(chunk_query).to receive(:select_map).with(:chunk_id).and_return(["abc123"])
        allow(Autodidact::Provider::GenerateBatchEmbeddings).to receive(:call)
          .with(texts: ["chunk two"])
          .and_return(success_result([embedding_b]))
      end

      it "only generates embeddings for new chunks and links all" do
        result = described_class.call(source_blob_id: "blob-1", raw_text: "raw text")

        expect(result).to be_success
        expect(result.payload).to eq(chunks_created: 1, chunks_reused: 1)
        expect(Autodidact::Provider::GenerateBatchEmbeddings).to have_received(:call).once
        expect(Autodidact::Models::SourceChunk).to have_received(:create).once
        expect(Autodidact::Storage::LinkChunksToSource).to have_received(:call).with(
          source_blob_id: "blob-1",
          chunk_mappings: [
            {chunk_id: "abc123", chunk_index: 0},
            {chunk_id: "def456", chunk_index: 1}
          ]
        )
      end
    end
  end
end
