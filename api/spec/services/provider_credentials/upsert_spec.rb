# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProviderCredentials::Upsert, type: :service do
  let_it_be(:user, refind: true) { create(:user) }

  it "verifies and stores a connected credential" do
    definition = instance_double(Analysis::ProviderDefinition, requires_credentials: true)
    verify_result = instance_double(ProviderCredentials::Verify::Result, failure?: false)

    allow(Analysis::ProviderRegistry).to receive(:fetch).with("openai").and_return(definition)
    allow(ProviderCredentials::Verify).to receive(:call)
      .with(provider: "openai", api_key: "sk-test-1234")
      .and_return(verify_result)

    result = described_class.call(user: user, provider: "openai", api_key: " sk-test-1234 ")

    expect(result).to be_success
    expect(result.credential).to have_attributes(
      provider: "openai",
      credential_kind: "user_key",
      key_fingerprint: "1234",
      status: "connected"
    )
    expect(result.credential.api_key).to eq("sk-test-1234")
  end

  it "returns failure when verification fails" do
    definition = instance_double(Analysis::ProviderDefinition, requires_credentials: true)
    verify_result = instance_double(ProviderCredentials::Verify::Result, failure?: true, error_message: "Invalid key")

    allow(Analysis::ProviderRegistry).to receive(:fetch).with("openai").and_return(definition)
    allow(ProviderCredentials::Verify).to receive(:call).and_return(verify_result)

    result = described_class.call(user: user, provider: "openai", api_key: "sk-bad")

    expect(result).to be_failure
    expect(result.error_message).to eq("Invalid key")
    expect(user.provider_credentials.where(provider: "openai")).to be_empty
  end
end
