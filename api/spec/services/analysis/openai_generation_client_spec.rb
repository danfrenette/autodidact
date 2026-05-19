# frozen_string_literal: true

require "rails_helper"

RSpec.describe Analysis::OpenaiGenerationClient do
  let(:openai_client) { instance_double(OpenAI::Client) }
  let(:source_chunk) { instance_double(SourceChunk, chunk_id: "chunk-1", content: "Chunk text") }

  before do
    allow(OpenAI::Client).to receive(:new).with(access_token: "sk-test").and_return(openai_client)
  end

  it "returns parsed JSON analysis" do
    allow(openai_client).to receive(:chat)
      .with(parameters: hash_including(model: "gpt-4o-mini"))
      .and_return("choices" => [{"message" => {"content" => JSON.dump(concepts: [], questions: [], quotes: [])}}])

    client = described_class.new(api_key: "sk-test", model: "gpt-4o-mini")

    expect(client.analyze(source_chunks: [source_chunk])).to eq(concepts: [], questions: [], quotes: [])
  end

  it "returns parsed JSON analysis from a fenced JSON response" do
    allow(openai_client).to receive(:chat)
      .with(parameters: hash_including(model: "gpt-4o-mini"))
      .and_return("choices" => [{"message" => {"content" => "```json\n#{JSON.dump(concepts: [], questions: [], quotes: [])}\n```"}}])

    client = described_class.new(api_key: "sk-test", model: "gpt-4o-mini")

    expect(client.analyze(source_chunks: [source_chunk])).to eq(concepts: [], questions: [], quotes: [])
  end

  it "raises a provider error for empty content" do
    allow(openai_client).to receive(:chat)
      .and_return("choices" => [{"message" => {"content" => ""}}])

    client = described_class.new(api_key: "sk-test", model: "gpt-4o-mini")

    expect { client.analyze(source_chunks: [source_chunk]) }
      .to raise_error(Analysis::ProviderError, "Provider returned empty content")
  end

  it "raises a provider error for invalid JSON" do
    allow(openai_client).to receive(:chat)
      .and_return("choices" => [{"message" => {"content" => "not json"}}])

    client = described_class.new(api_key: "sk-test", model: "gpt-4o-mini")

    expect { client.analyze(source_chunks: [source_chunk]) }
      .to raise_error(Analysis::ProviderError, /Provider returned invalid JSON/)
  end
end
