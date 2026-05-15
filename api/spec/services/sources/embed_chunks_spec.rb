# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::EmbedChunks, type: :service do
  describe ".call" do
    it "stores embeddings from the configured client" do
      chunk = create(:source_chunk)
      embedding = Array.new(1536, 0.1)
      client = double(embed: embedding)

      result = described_class.call(source_chunks: [chunk], client: client)

      expect(result).to be_success
      expect(client).to have_received(:embed).with(chunk.content)
      expect(chunk.reload.embedding).to eq(embedding)
    end
  end
end
