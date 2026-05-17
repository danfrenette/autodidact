# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProviderRoleSettings::Availability, type: :service do
  let_it_be(:user, refind: true) { create(:user) }

  before do
    allow(Analysis::ProviderRegistry).to receive(:mock_enabled?).and_return(false)
  end

  it "is available when embedding and generation settings use connected credentials" do
    credential = create(:provider_credential, user: user)
    create(:provider_role_setting, user: user, provider_credential: credential, role: :embedding)
    create(:provider_role_setting, :generation, user: user, provider_credential: credential)

    result = described_class.call(user: user)

    expect(result).to be_success
    expect(result.available).to be true
    expect(result.missing_roles).to be_empty
  end

  it "reports missing roles" do
    credential = create(:provider_credential, user: user)
    create(:provider_role_setting, user: user, provider_credential: credential, role: :embedding)

    result = described_class.call(user: user)

    expect(result.available).to be false
    expect(result.missing_roles).to eq([:generation])
  end
end
