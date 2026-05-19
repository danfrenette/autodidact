# frozen_string_literal: true

require "rails_helper"

RSpec.describe "SourceRetries", type: :request do
  include ActiveJob::TestHelper

  include_context "auth users"
  include_context "pdf blob"
  include_context "mock provider settings"

  describe "POST /sources/:source_id/retry" do
    before do
      sign_in(user: current_user)
    end

    it "reprocesses failed selections end-to-end" do
      source = create(:source, :failed, user: current_user, title: "Retry Fixture", original_filename: "with_toc.pdf")
      source.asset.attach(pdf_blob)
      failed_selection = create(
        :source_selection,
        :failed,
        source: source,
        title: "Introduction",
        label: "01",
        position: {ordinal: 1},
        locator: {type: "page_range", start: 1, end: 1},
        pipeline_stage: "ANALYZE",
        error_details: {"code" => "quota_exceeded"}
      )
      complete_selection = create(:source_selection, :complete, source: source, title: "Already Complete", label: "02")

      perform_enqueued_jobs do
        post source_retry_path(source), as: :json
      end

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "source")).to include(
        "id" => source.id,
        "status" => "complete"
      )
      expect(source.reload).to be_complete
      expect(failed_selection.reload).to be_complete
      expect(complete_selection.reload).to be_complete
      expect(failed_selection.pipeline_stage).to be_nil
      expect(failed_selection.error_message).to be_nil
      expect(failed_selection.error_details).to eq({})
      expect(failed_selection.source_selection_content.raw_text).to be_present
      expect(failed_selection.concepts).to be_present
      expect(failed_selection.questions).to be_present
      expect(failed_selection.quotes).to be_present
    end

    it "rejects retrying a source that is not failed" do
      source = create(:source, :complete, user: current_user)
      create(:source_selection, :complete, source: source)

      expect {
        perform_enqueued_jobs do
          post source_retry_path(source), as: :json
        end
      }.not_to change(SourceChunk, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_response.fetch("error")).to include("code" => "source_retry_failed")
    end
  end
end
