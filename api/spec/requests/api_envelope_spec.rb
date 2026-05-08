# frozen_string_literal: true

require "rails_helper"

RSpec.describe "API envelope structure", type: :request do
  describe "GET /csrf-token" do
    it "returns a standard envelope with camelCase keys" do
      get csrf_token_path

      expect(response).to have_http_status(:ok)

      expect(json_response).to include("data", "error", "meta")
      expect(json_response["data"]).to include("csrfToken")
      expect(json_response["error"]).to be_nil
      expect(json_response["meta"]).to eq({})
    end
  end

  describe "unauthorized responses" do
    it "returns a standard error envelope" do
      # Try to access a protected endpoint without authentication
      post sources_path, params: {source: {title: "Test"}}, as: :json

      expect(response).to have_http_status(:unauthorized)

      expect(json_response).to include("data", "error", "meta")
      expect(json_response["data"]).to be_nil
      expect(json_response["error"]).to include("code", "message", "details")
      expect(json_response["error"]["code"]).to eq("unauthorized")
      expect(json_response["meta"]).to eq({})
    end
  end
end
