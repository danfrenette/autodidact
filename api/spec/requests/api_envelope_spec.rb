# frozen_string_literal: true

require "rails_helper"

RSpec.describe "API envelope structure", type: :request do
  describe "GET /csrf-token" do
    it "returns a standard envelope with camelCase keys" do
      get csrf_token_path

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json).to include("data", "error", "meta")
      expect(json["data"]).to include("csrfToken")
      expect(json["error"]).to be_nil
      expect(json["meta"]).to eq({})
    end
  end

  describe "unauthorized responses" do
    it "returns a standard error envelope" do
      # Try to access a protected endpoint without authentication
      post sources_path, params: {source: {title: "Test"}}, as: :json

      expect(response).to have_http_status(:unauthorized)

      json = JSON.parse(response.body)
      expect(json).to include("data", "error", "meta")
      expect(json["data"]).to be_nil
      expect(json["error"]).to include("code", "message", "details")
      expect(json["error"]["code"]).to eq("unauthorized")
      expect(json["meta"]).to eq({})
    end
  end
end
