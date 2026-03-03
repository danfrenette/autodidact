# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Storage::PersistSourceChunks do
  let(:chunk) { Autodidact::TextChunk.new(content: "chunk content", chunk_index: 0) }

  before do
    allow(Autodidact::Chunking::TextChunker).to receive(:call).and_return(success_result([chunk]))
  end

  describe ".call" do
    context "when provider is dev" do
      let(:config) { instance_double(Autodidact::Configuration, provider: "dev") }

      before { allow(Autodidact).to receive(:config).and_return(config) }

      it "persists chunks without calling embeddings API" do
        allow(Autodidact::Provider::GenerateEmbedding).to receive(:call)
        allow(Autodidact::Models::SourceChunk).to receive(:create)

        result = described_class.call(source_blob_id: "blob-1", raw_text: "raw text")

        expect(result).to be_success
        expect(result.payload).to eq(chunks_created: 1)
        expect(Autodidact::Provider::GenerateEmbedding).not_to have_received(:call)
        expect(Autodidact::Models::SourceChunk).to have_received(:create).with(
          source_blob_id: "blob-1",
          chunk_index: 0,
          content: "chunk content",
          embedding: nil
        )
      end
    end

    context "when provider is openai" do
      let(:embedding) { [0.1, 0.2, 0.3] }
      let(:config) { instance_double(Autodidact::Configuration, provider: "openai") }

      before { allow(Autodidact).to receive(:config).and_return(config) }

      it "generates embeddings and persists them" do
        allow(Autodidact::Provider::GenerateEmbedding).to receive(:call)
          .with(text: "chunk content")
          .and_return(success_result(embedding))
        allow(Autodidact::Models::SourceChunk).to receive(:create)

        result = described_class.call(source_blob_id: "blob-1", raw_text: "raw text")

        expect(result).to be_success
        expect(Autodidact::Provider::GenerateEmbedding).to have_received(:call).with(text: "chunk content")
        expect(Autodidact::Models::SourceChunk).to have_received(:create).with(
          source_blob_id: "blob-1",
          chunk_index: 0,
          content: "chunk content",
          embedding: embedding
        )
      end
    end
  end
end
