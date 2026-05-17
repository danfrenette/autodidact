# frozen_string_literal: true

require "rails_helper"

RSpec.describe Analysis::GoogleEmbeddingClient do
  let(:connection) { instance_double(Faraday::Connection) }
  let(:request_class) { Struct.new(:params, :headers, :body) }
  let(:request) { request_class.new({}, {}, nil) }
  let(:embedding) { Array.new(1536, 0.1) }

  before do
    allow(Faraday).to receive(:new)
      .with(url: "https://generativelanguage.googleapis.com/v1beta/")
      .and_return(connection)
  end

  it "returns a 1536-dimensional embedding" do
    response = instance_double(
      Faraday::Response,
      success?: true,
      body: {"embedding" => {"values" => embedding}},
      status: 200
    )
    allow(connection).to receive(:post)
      .with("models/gemini-embedding-001:embedContent")
      .and_yield(request)
      .and_return(response)

    client = described_class.new(api_key: "google-key", model: "gemini-embedding-001")

    expect(client.embed("hello")).to eq(embedding)
    expect(request.params).to eq("key" => "google-key")
    expect(request.headers).to eq("Content-Type" => "application/json")
    expect(JSON.parse(request.body)).to eq(
      "model" => "models/gemini-embedding-001",
      "content" => {"parts" => [{"text" => "hello"}]},
      "outputDimensionality" => 1536
    )
  end

  it "raises a provider error when the response is empty" do
    response = instance_double(Faraday::Response, success?: true, body: {"embedding" => {"values" => []}}, status: 200)
    allow(connection).to receive(:post).and_yield(request).and_return(response)

    client = described_class.new(api_key: "google-key", model: "gemini-embedding-001")

    expect { client.embed("hello") }.to raise_error(Analysis::ProviderError, "Embedding response was empty")
  end

  it "raises the Google error message for unsuccessful responses" do
    response = instance_double(
      Faraday::Response,
      success?: false,
      body: {"error" => {"message" => "API key invalid"}},
      status: 400
    )
    allow(connection).to receive(:post).and_yield(request).and_return(response)

    client = described_class.new(api_key: "google-key", model: "gemini-embedding-001")

    expect { client.embed("hello") }.to raise_error(Analysis::ProviderError, "API key invalid")
  end
end
