# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProviderCredentials::EnsureMockDefaults, type: :service do
  let_it_be(:user, refind: true) { create(:user) }

  it "creates a mock credential and role settings when mock is enabled" do
    mock_provider = instance_double(Analysis::ProviderDefinition)

    allow(Analysis::ProviderRegistry).to receive(:mock_enabled?).and_return(true)
    allow(Analysis::ProviderRegistry).to receive(:fetch).with("mock").and_return(mock_provider)
    allow(mock_provider).to receive(:default_model_for).with(:embedding).and_return("mock-embedding")
    allow(mock_provider).to receive(:default_model_for).with(:generation).and_return("mock-generation")

    result = described_class.call(user: user)

    expect(result).to be_success
    expect(result.credential).to have_attributes(provider: "mock", credential_kind: "system", status: "connected")
    expect(user.provider_role_settings.find_by!(role: :embedding).model).to eq("mock-embedding")
    expect(user.provider_role_settings.find_by!(role: :generation).model).to eq("mock-generation")
  end

  it "does nothing when mock is disabled" do
    allow(Analysis::ProviderRegistry).to receive(:mock_enabled?).and_return(false)

    result = described_class.call(user: user)

    expect(result).to be_success
    expect(result.credential).to be_nil
  end
end
