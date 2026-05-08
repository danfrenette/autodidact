# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Concepts", type: :request do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }
  let_it_be(:other_user, refind: true) { create(:user, id: "user_456") }

  describe "GET /source_selections/:source_selection_id/concepts" do
    let_it_be(:source, refind: true) { create(:source, user: current_user) }
    let_it_be(:selection, refind: true) do
      create(:source_selection, source: source, title: "Chapter 7: Transactions")
    end

    before do
      sign_in(user: current_user)
      create(:concept, :core, source_selection: selection)
      create(:concept, :supporting, source_selection: selection)
      create(:concept, :advanced, source_selection: selection)
    end

    it "returns all concepts for the selection" do
      get source_selection_concepts_path(selection)

      expect(response).to have_http_status(:ok)
      expect(json_response.length).to eq(3)

      acid = json_response.find { |c| c["name"] == "ACID Guarantees" }
      expect(acid["classification"]).to eq("core")
      expect(acid["definition"]).to be_present
      expect(acid["why_it_matters"]).to be_present
    end

    it "returns concepts in the expected JSON structure" do
      get source_selection_concepts_path(selection)

      json_response.each do |concept|
        expect(concept).to include("id", "name", "classification", "definition", "why_it_matters")
      end
    end
  end

  context "when the user does not own the source" do
    let_it_be(:source, refind: true) { create(:source, user: other_user) }
    let_it_be(:selection, refind: true) do
      create(:source_selection, source: source, title: "Chapter 7: Transactions")
    end

    before { sign_in(user: current_user) }

    it "returns not found" do
      get source_selection_concepts_path(selection)

      expect(response).to have_http_status(:not_found)
    end
  end

  context "when selection has no concepts" do
    let_it_be(:source, refind: true) { create(:source, user: current_user) }
    let_it_be(:empty_selection, refind: true) do
      create(:source_selection, source: source, title: "Empty Chapter")
    end

    before { sign_in(user: current_user) }

    it "returns empty array" do
      get source_selection_concepts_path(empty_selection)

      expect(response).to have_http_status(:ok)
      expect(json_response).to eq([])
    end
  end
end
