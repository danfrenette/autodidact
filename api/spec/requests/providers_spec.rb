# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Providers", type: :request do
  let_it_be(:current_user, refind: true) { create(:user) }

  before { sign_in(user: current_user) }

  describe "GET /providers" do
    it "returns Google AI Studio as an embedding and generation provider" do
      get providers_path

      expect(response).to have_http_status(:ok)
      google = json_response.dig("data", "providers").find { |provider| provider.fetch("id") == "google" }

      expect(google).to eq(
        "id" => "google",
        "displayName" => "Google AI Studio",
        "supportedRoles" => ["embedding", "generation"],
        "requiresCredentials" => true,
        "modelsByRole" => {
          "embedding" => ["gemini-embedding-001"],
          "generation" => ["gemini-2.0-flash-lite"]
        },
        "defaultModelsByRole" => {
          "embedding" => "gemini-embedding-001",
          "generation" => "gemini-2.0-flash-lite"
        }
      )
    end
  end

  describe "GET /provider_availability" do
    it "returns provider role availability" do
      get provider_availability_path

      expect(response).to have_http_status(:ok)
      expect(json_response).to include(
        "data" => include(
          "available" => be_in([true, false]),
          "missingRoles" => be_an(Array),
          "roleSettings" => be_an(Array)
        ),
        "error" => nil,
        "meta" => {}
      )
    end
  end
end
