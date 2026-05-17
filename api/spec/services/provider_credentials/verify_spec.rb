# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProviderCredentials::Verify, type: :service do
  it "verifies OpenAI credentials with a small embedding request" do
    client = instance_double(Analysis::OpenaiEmbeddingClient)

    allow(Analysis::OpenaiEmbeddingClient).to receive(:new)
      .with(api_key: "sk-test", model: "text-embedding-3-small")
      .and_return(client)
    allow(client).to receive(:embed).with("verify").and_return([0.1, 0.2])

    result = described_class.call(provider: "openai", api_key: "sk-test")

    expect(result).to be_success
  end

  it "verifies Google credentials with a small embedding request" do
    client = instance_double(Analysis::GoogleEmbeddingClient)

    allow(Analysis::GoogleEmbeddingClient).to receive(:new)
      .with(api_key: "google-key", model: "gemini-embedding-001")
      .and_return(client)
    allow(client).to receive(:embed).with("verify").and_return([0.1, 0.2])

    result = described_class.call(provider: "google", api_key: "google-key")

    expect(result).to be_success
  end

  it "returns failure for provider errors" do
    client = instance_double(Analysis::OpenaiEmbeddingClient)

    allow(Analysis::OpenaiEmbeddingClient).to receive(:new).and_return(client)
    allow(client).to receive(:embed).and_raise(Analysis::ProviderError, "Unauthorized")

    result = described_class.call(provider: "openai", api_key: "sk-test")

    expect(result).to be_failure
    expect(result.error_message).to eq("Unauthorized")
  end
end
