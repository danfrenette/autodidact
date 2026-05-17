# frozen_string_literal: true

require "rails_helper"

RSpec.describe Analysis::ClientForRole, type: :service do
  let_it_be(:user, refind: true) { create(:user) }

  it "returns the OpenAI embedding client for an OpenAI embedding setting" do
    credential = instance_double(ProviderCredential, api_key: "sk-test")
    role_setting = instance_double(
      ProviderRoleSetting,
      role: "embedding",
      provider: "openai",
      provider_credential: credential,
      model: "text-embedding-3-small",
      embedding?: true,
      generation?: false
    )
    resolve_result = instance_double(ProviderRoleSettings::Resolve::Result, failure?: false, role_setting: role_setting)
    client = instance_double(Analysis::OpenaiEmbeddingClient)

    allow(ProviderRoleSettings::Resolve).to receive(:call)
      .with(user: user, role: :embedding)
      .and_return(resolve_result)
    allow(Analysis::OpenaiEmbeddingClient).to receive(:new)
      .with(api_key: "sk-test", model: "text-embedding-3-small")
      .and_return(client)

    result = described_class.call(user: user, role: :embedding)

    expect(result).to be_success
    expect(result.client).to eq(client)
  end

  it "returns the mock generation client for a mock generation setting" do
    role_setting = instance_double(
      ProviderRoleSetting,
      role: "generation",
      provider: "mock",
      embedding?: false,
      generation?: true
    )
    resolve_result = instance_double(ProviderRoleSettings::Resolve::Result, failure?: false, role_setting: role_setting)
    client = instance_double(Analysis::MockGenerationClient)

    allow(ProviderRoleSettings::Resolve).to receive(:call)
      .with(user: user, role: :generation)
      .and_return(resolve_result)
    allow(Analysis::MockGenerationClient).to receive(:new).and_return(client)

    result = described_class.call(user: user, role: :generation)

    expect(result).to be_success
    expect(result.client).to eq(client)
  end

  it "returns the Google generation client for a Google generation setting" do
    credential = instance_double(ProviderCredential, api_key: "google-key")
    role_setting = instance_double(
      ProviderRoleSetting,
      role: "generation",
      provider: "google",
      provider_credential: credential,
      model: "gemini-2.0-flash-lite",
      embedding?: false,
      generation?: true
    )
    resolve_result = instance_double(ProviderRoleSettings::Resolve::Result, failure?: false, role_setting: role_setting)
    client = instance_double(Analysis::GoogleGenerationClient)

    allow(ProviderRoleSettings::Resolve).to receive(:call)
      .with(user: user, role: :generation)
      .and_return(resolve_result)
    allow(Analysis::GoogleGenerationClient).to receive(:new)
      .with(api_key: "google-key", model: "gemini-2.0-flash-lite")
      .and_return(client)

    result = described_class.call(user: user, role: :generation)

    expect(result).to be_success
    expect(result.client).to eq(client)
  end
end
