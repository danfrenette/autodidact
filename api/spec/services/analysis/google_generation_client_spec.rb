# frozen_string_literal: true

require "rails_helper"

RSpec.describe Analysis::GoogleGenerationClient do
  let(:connection) { instance_double(Faraday::Connection) }
  let(:request_class) { Struct.new(:params, :headers, :body) }
  let(:request) { request_class.new({}, {}, nil) }
  let(:source_chunk) { instance_double(SourceChunk, chunk_id: "chunk-1", content: "Chunk text") }

  before do
    allow(Faraday).to receive(:new)
      .with(url: "https://generativelanguage.googleapis.com/v1beta/")
      .and_return(connection)
  end

  it "returns parsed JSON analysis" do
    response = instance_double(
      Faraday::Response,
      success?: true,
      body: {
        "candidates" => [
          {"content" => {"parts" => [{"text" => JSON.dump(
            concepts: [{name: "Concept", cited_chunk_ids: ["C1"]}],
            questions: [],
            quotes: []
          )}]}}
        ]
      },
      status: 200
    )
    allow(connection).to receive(:post)
      .with("models/gemini-2.0-flash-lite:generateContent")
      .and_yield(request)
      .and_return(response)

    client = described_class.new(api_key: "google-key", model: "gemini-2.0-flash-lite")

    expect(client.analyze(source_chunks: [source_chunk])).to eq(
      concepts: [{name: "Concept", cited_chunk_ids: ["chunk-1"]}],
      questions: [],
      quotes: []
    )
    expect(request.params).to eq("key" => "google-key")
    expect(request.headers).to eq("Content-Type" => "application/json")
    expect(JSON.parse(request.body)).to include(
      "contents" => [hash_including("role" => "user")],
      "generationConfig" => {
        "temperature" => 0.2,
        "responseMimeType" => "application/json"
      }
    )
  end

  it "returns parsed JSON analysis from a fenced JSON response" do
    response = instance_double(
      Faraday::Response,
      success?: true,
      body: {
        "candidates" => [
          {"content" => {"parts" => [{"text" => "```json\n#{JSON.dump(concepts: [], questions: [], quotes: [])}\n```"}]}}
        ]
      },
      status: 200
    )
    allow(connection).to receive(:post).and_yield(request).and_return(response)

    client = described_class.new(api_key: "google-key", model: "gemini-2.0-flash-lite")

    expect(client.analyze(source_chunks: [source_chunk])).to eq(concepts: [], questions: [], quotes: [])
  end

  it "raises a provider error for empty content" do
    response = instance_double(Faraday::Response, success?: true, body: {"candidates" => []}, status: 200)
    allow(connection).to receive(:post).and_yield(request).and_return(response)

    client = described_class.new(api_key: "google-key", model: "gemini-2.0-flash-lite")

    expect { client.analyze(source_chunks: [source_chunk]) }
      .to raise_error(Analysis::ProviderError, "Provider returned empty content")
  end

  it "raises a provider error for invalid JSON" do
    response = instance_double(
      Faraday::Response,
      success?: true,
      body: {"candidates" => [{"content" => {"parts" => [{"text" => "not json"}]}}]},
      status: 200
    )
    allow(connection).to receive(:post).and_yield(request).and_return(response)

    client = described_class.new(api_key: "google-key", model: "gemini-2.0-flash-lite")

    expect { client.analyze(source_chunks: [source_chunk]) }
      .to raise_error(Analysis::ProviderError, /Provider returned invalid JSON/)
  end

  it "raises a structured provider error for quota responses" do
    response = instance_double(
      Faraday::Response,
      success?: false,
      body: {
        "error" => {
          "status" => "RESOURCE_EXHAUSTED",
          "message" => "Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests. Please retry in 52.067879746s."
        }
      },
      status: 429
    )
    allow(connection).to receive(:post).and_yield(request).and_return(response)

    client = described_class.new(api_key: "google-key", model: "gemini-2.0-flash-lite")

    expect { client.analyze(source_chunks: [source_chunk]) }
      .to raise_error(Analysis::ProviderError) { |error|
        expect(error.code).to eq("quota_exceeded")
        expect(error.retry_after).to eq(52.067879746)
      }
  end
end
