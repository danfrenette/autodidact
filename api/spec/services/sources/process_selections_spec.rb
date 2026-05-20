# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::ProcessSelections, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }

  describe ".call" do
    it "enqueues processing jobs after committing selection status changes" do
      source = create(:source, :uploaded, user: current_user)
      selection = create(:source_selection, :pending, source: source)
      reconciler_result = double(
        success?: true,
        failure?: false,
        resolved_selections: [
          {
            selection: selection,
            title: "Chapter 1",
            label: "01",
            position: {ordinal: 1},
            locator: {type: "page_range", start: 1, end: 12}
          }
        ]
      )
      baseline_open_transactions = ActiveRecord::Base.connection.open_transactions
      open_transactions_when_enqueued = nil

      allow(Sources::SelectionReconciler).to receive(:new).and_return(
        double(call: reconciler_result)
      )
      allow(ProcessSourceSelectionJob).to receive(:perform_later) do
        open_transactions_when_enqueued = ActiveRecord::Base.connection.open_transactions
      end

      result = described_class.call(source: source)

      expect(result).to be_success
      expect(selection.reload.status).to eq("queued")
      expect(ProcessSourceSelectionJob).to have_received(:perform_later).with(selection.id)
      expect(open_transactions_when_enqueued).to eq(baseline_open_transactions)
    end

    it "waits for the outer source creation transaction before enqueueing jobs" do
      source = create(:source, :uploaded, user: current_user)
      selection = create(:source_selection, :pending, source: source)
      reconciler_result = double(
        success?: true,
        failure?: false,
        resolved_selections: [
          {
            selection: selection,
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
      allow(ProcessSourceSelectionJob).to receive(:perform_later)

      Source.transaction do
        result = described_class.call(source: source)

        expect(result).to be_success
        expect(ProcessSourceSelectionJob).not_to have_received(:perform_later)
      end

      expect(ProcessSourceSelectionJob).to have_received(:perform_later).with(selection.id)
    end
  end
end
