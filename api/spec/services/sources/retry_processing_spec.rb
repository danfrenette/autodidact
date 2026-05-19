# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::RetryProcessing, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }

  describe ".call" do
    it "resets failed selections and enqueues them for processing" do
      source = create(:source, :failed, user: current_user)
      failed_selection = create(
        :source_selection,
        :failed,
        source: source,
        pipeline_stage: "ANALYZE",
        error_details: {"code" => "quota_exceeded"}
      )
      complete_selection = create(:source_selection, :complete, source: source)

      allow(ProcessSourceSelectionJob).to receive(:perform_later)

      result = described_class.call(source: source)

      expect(result).to be_success
      expect(source.reload.status).to eq("processing")
      expect(failed_selection.reload).to have_attributes(
        status: "queued",
        pipeline_stage: nil,
        error_message: nil,
        error_details: {}
      )
      expect(complete_selection.reload.status).to eq("complete")
      expect(ProcessSourceSelectionJob).to have_received(:perform_later).with(failed_selection.id)
      expect(ProcessSourceSelectionJob).not_to have_received(:perform_later).with(complete_selection.id)
    end
  end
end
