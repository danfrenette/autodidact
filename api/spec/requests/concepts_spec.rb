# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Concepts", type: :request do
  let(:user_id) { "user_123" }
  let(:other_user_id) { "user_456" }
  let(:headers) { { "Authorization" => "Bearer test_token", "X-User-Id" => user_id } }
  let(:other_headers) { { "Authorization" => "Bearer test_token", "X-User-Id" => other_user_id } }
  let(:source) { create(:source, user_id: user_id) }
  let(:selection) { create(:source_selection, source: source, title: "Chapter 7: Transactions") }

  describe "GET /source_selections/:source_selection_id/concepts" do
    before do
      create(:concept, source_selection: selection, name: "ACID Guarantees", classification: "core")
      create(:concept, :supporting, source_selection: selection)
      create(:concept, :advanced, source_selection: selection)
    end

    context "when the user owns the source" do
      it "returns all concepts for the selection" do
        get source_selection_concepts_path(selection), headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(3)

        acid = json_response.find { |c| c["name"] == "ACID Guarantees" }
        expect(acid["classification"]).to eq("core")
        expect(acid["definition"]).to be_present
        expect(acid["why_it_matters"]).to be_present
      end
    end

    context "when the user does not own the source" do
      it "returns not found" do
        get source_selection_concepts_path(selection), headers: other_headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when selection has no concepts" do
      let(:empty_selection) { create(:source_selection, source: source) }

      it "returns empty array" do
        get source_selection_concepts_path(empty_selection), headers: headers

        expect(response).to have_http_status(:ok)
        expect(json_response).to eq([])
      end
    end
  end
end
