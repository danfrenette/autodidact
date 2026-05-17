# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProviderRoleSettings::Upsert, type: :service do
  let_it_be(:user, refind: true) { create(:user) }

  it "stores the role setting for a connected credential" do
    credential = create(:provider_credential, user: user, provider: "openai")
    definition = instance_double(
      Analysis::ProviderDefinition,
      supports?: true,
      models_for: ["text-embedding-3-small"],
      requires_credentials: true,
      display_name: "OpenAI"
    )

    allow(Analysis::ProviderRegistry).to receive(:fetch).with("openai").and_return(definition)

    result = described_class.call(
      user: user,
      role: :embedding,
      provider: "openai",
      model: "text-embedding-3-small"
    )

    expect(result).to be_success
    expect(result.role_setting).to have_attributes(
      role: "embedding",
      provider_credential_id: credential.id,
      model: "text-embedding-3-small"
    )
  end

  it "returns failure when the provider does not support the role" do
    definition = instance_double(Analysis::ProviderDefinition, supports?: false)

    allow(Analysis::ProviderRegistry).to receive(:fetch).with("openai").and_return(definition)

    result = described_class.call(user: user, role: :embedding, provider: "openai", model: "gpt-4o-mini")

    expect(result).to be_failure
    expect(result.error_message).to eq("Provider does not support embedding")
  end

  it "returns failure when the selected model is unavailable" do
    definition = instance_double(Analysis::ProviderDefinition, supports?: true, models_for: ["gpt-4o-mini"])

    allow(Analysis::ProviderRegistry).to receive(:fetch).with("openai").and_return(definition)

    result = described_class.call(user: user, role: :embedding, provider: "openai", model: "text-embedding-3-small")

    expect(result).to be_failure
    expect(result.error_message).to eq("Model is not available for embedding")
  end
end
