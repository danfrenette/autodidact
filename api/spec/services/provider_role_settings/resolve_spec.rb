# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProviderRoleSettings::Resolve, type: :service do
  let_it_be(:user, refind: true) { create(:user) }

  before do
    allow(Analysis::ProviderRegistry).to receive(:mock_enabled?).and_return(false)
  end

  it "returns the configured connected role setting" do
    credential = create(:provider_credential, user: user)
    role_setting = create(:provider_role_setting, user: user, provider_credential: credential, role: :embedding)

    result = described_class.call(user: user, role: :embedding)

    expect(result).to be_success
    expect(result.role_setting).to eq(role_setting)
  end

  it "returns failure when the role setting is missing" do
    result = described_class.call(user: user, role: :generation)

    expect(result).to be_failure
    expect(result.error_message).to eq("Generation provider not configured")
  end

  it "returns failure when the credential is disconnected" do
    credential = create(:provider_credential, user: user, status: :disconnected)
    create(:provider_role_setting, user: user, provider_credential: credential, role: :embedding)

    result = described_class.call(user: user, role: :embedding)

    expect(result).to be_failure
    expect(result.error_message).to eq("openai credential is not connected")
  end
end
