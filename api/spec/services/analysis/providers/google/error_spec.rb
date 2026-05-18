# frozen_string_literal: true

require "rails_helper"

RSpec.describe Analysis::Providers::Google::Error do
  it "classifies quota errors with a user-actionable message" do
    error = described_class.from_response(
      status: 429,
      body: {
        "error" => {
          "status" => "RESOURCE_EXHAUSTED",
          "message" => "Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests. Please retry in 52.067879746s."
        }
      }
    )

    expect(error).to have_attributes(
      code: "quota_exceeded",
      provider: "google",
      retry_after: 52.067879746
    )
    expect(error.message).to eq("Google quota exceeded. Check billing, wait for quota to reset, or choose another generation provider.")
    expect(error).to be_credential_blocking
  end

  it "classifies invalid credentials" do
    error = described_class.from_response(
      status: 403,
      body: {"error" => {"status" => "PERMISSION_DENIED", "message" => "API key invalid"}}
    )

    expect(error.code).to eq("invalid_api_key")
    expect(error.message).to eq("Google credential is no longer valid. Update your API key or choose another provider.")
  end
end
