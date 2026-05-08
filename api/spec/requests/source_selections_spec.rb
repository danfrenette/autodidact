# frozen_string_literal: true

require "rails_helper"

RSpec.describe "SourceSelections", type: :request do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }
  let_it_be(:other_user, refind: true) { create(:user, id: "user_456") }

  describe "POST /sources/:source_id/selections" do
    let_it_be(:source, refind: true) { create(:source, user: current_user) }

    before { sign_in(user: current_user) }

    it "creates a new selection for the source" do
      selection_params = {
        source_selection: {
          kind: "chapter",
          title: "New Chapter",
          label: "05",
          position: {ordinal: 5},
          locator: {type: "page_range", start: 100, end: 120}
        }
      }

      expect {
        post source_selections_path(source), params: selection_params, as: :json
      }.to change(SourceSelection, :count).by(1)

      expect(response).to have_http_status(:created)

      expect(json_response.dig("data", "sourceSelection", "title")).to eq("New Chapter")
      expect(json_response.dig("data", "sourceSelection", "label")).to eq("05")
      expect(json_response.fetch("error")).to be_nil
    end

    it "returns validation errors when selection params are invalid" do
      selection_params = {
        source_selection: {
          kind: "chapter",
          title: "",
          label: "05"
        }
      }

      expect {
        post source_selections_path(source), params: selection_params, as: :json
      }.not_to change(SourceSelection, :count)

      expect(response).to have_http_status(:unprocessable_content)

      expect(json_response.fetch("error")).to include("code" => "validation_failed")
    end

    it "returns 404 for a source belonging to another user" do
      other_source = create(:source, user: other_user)

      selection_params = {
        source_selection: {
          kind: "chapter",
          title: "New Chapter",
          label: "05"
        }
      }

      post source_selections_path(other_source), params: selection_params, as: :json

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /sources/:source_id/selections/:id" do
    let_it_be(:source, refind: true) { create(:source, user: current_user) }

    before { sign_in(user: current_user) }

    it "deletes a pending selection" do
      selection = create(:source_selection, :pending, source: source, title: "To Delete")

      expect {
        delete source_selection_path(source, selection), as: :json
      }.to change(SourceSelection, :count).by(-1)

      expect(response).to have_http_status(:ok)

      expect(json_response.dig("data", "sourceSelection", "title")).to eq("To Delete")
      expect(json_response.fetch("error")).to be_nil
    end

    it "returns conflict when trying to delete a non-pending selection" do
      selection = create(:source_selection, :complete, source: source)

      expect {
        delete source_selection_path(source, selection), as: :json
      }.not_to change(SourceSelection, :count)

      expect(response).to have_http_status(:conflict)

      expect(json_response.fetch("error")).to include("code" => "conflict")
      expect(json_response.dig("error", "message")).to include("Only pending selections can be deleted")
    end

    it "returns 404 for a selection belonging to another user's source" do
      other_source = create(:source, user: other_user)
      other_selection = create(:source_selection, source: other_source)

      delete source_selection_path(other_source, other_selection), as: :json

      expect(response).to have_http_status(:not_found)
    end
  end
end
