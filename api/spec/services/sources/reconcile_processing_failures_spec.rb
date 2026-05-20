# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::ReconcileProcessingFailures, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }

  it "marks queued selections with failed queue executions as failed" do
    source = create(:source, :processing, user: current_user)
    stuck_selection = create(:source_selection, status: :queued, source: source)
    complete_selection = create(:source_selection, :complete, source: source)
    failed_execution = double(job: queue_job_for(stuck_selection.id))
    complete_execution = double(job: queue_job_for(complete_selection.id))

    result = described_class.call(source: source, failed_executions: [failed_execution, complete_execution])

    expect(result).to be_success
    expect(result.count).to eq(1)
    expect(stuck_selection.reload).to have_attributes(
      status: "failed",
      error_message: "Processing job failed before completion"
    )
    expect(stuck_selection.error_details).to include(
      "stage" => "PROCESS",
      "code" => "job_failed",
      "action" => "retry"
    )
    expect(complete_selection.reload).to be_complete
    expect(source.reload).to be_failed
  end

  def queue_job_for(selection_id)
    double(
      class_name: "ProcessSourceSelectionJob",
      arguments: {"arguments" => [selection_id]}
    )
  end
end
