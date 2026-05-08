# frozen_string_literal: true

require "rails_helper"

RSpec.describe "SourceProcesses", type: :request do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }
  let_it_be(:other_user, refind: true) { create(:user, id: "user_456") }

  describe "POST /sources/:source_id/process" do
    before { sign_in(user: current_user) }

    context "with an attached asset" do
      let_it_be(:source, refind: true) do
        create(:source, :uploaded, user: current_user)
      end

      before do
        allow_any_instance_of(Source).to receive(:asset).and_return(
          double(attached?: true, open: nil)
        )
      end

      it "initiates processing and returns success" do
        reconciler_result = double(
          success?: true,
          resolved_selections: [
            {
              selection: create(:source_selection, :pending, source: source),
              title: "Chapter 1",
              label: "01",
              position: {ordinal: 1},
              locator: {type: "page_range", start: 1, end: 12}
            }
          ]
        )
        allow(Sources::SelectionReconciler).to receive(:new).and_return(
          double(call: reconciler_result)
        )

        expect(ProcessSourceSelectionJob).to receive(:perform_later).at_least(:once)

        post source_process_path(source), as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.fetch("error")).to be_nil
      expect(source.reload.status).to eq("processing")
    end

      it "returns unprocessable entity when reconciliation fails" do
        reconciler_result = double(
          success?: false,
          failures: [
            {
              source_selection_id: "test-id",
              title: "Chapter 1",
              label: "01",
              reason: "no_matching_chapter"
            }
          ]
        )
        allow(Sources::SelectionReconciler).to receive(:new).and_return(
          double(call: reconciler_result)
        )

        post source_process_path(source), as: :json

        expect(response).to have_http_status(:unprocessable_content)
      expect(json_response.fetch("error")).to include("code" => "selection_reconciliation_failed")
      end
    end

    context "without an attached asset" do
      let_it_be(:source, refind: true) do
        create(:source, user: current_user, status: "draft")
      end

      it "returns unprocessable entity" do
        post source_process_path(source), as: :json

        expect(response).to have_http_status(:unprocessable_content)

        expect(json_response.fetch("error")).to include("code" => "selection_reconciliation_failed")
      end
    end

    it "returns 404 for a source belonging to another user" do
      other_source = create(:source, user: other_user)

      post source_process_path(other_source), as: :json

      expect(response).to have_http_status(:not_found)
    end
  end
end
