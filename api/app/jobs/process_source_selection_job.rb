# frozen_string_literal: true

class ProcessSourceSelectionJob < ApplicationJob
  queue_as :default
  retry_on ActiveRecord::RecordNotFound, wait: 1.second, attempts: 5

  def perform(source_selection_id)
    source_selection = SourceSelection.includes(:source).find(source_selection_id)
    Sources::ProcessSelection.call(source_selection: source_selection)
  rescue ActiveRecord::RecordNotFound
    raise
  rescue => error
    mark_failed(source_selection, error)
  end

  private

  def mark_failed(source_selection, error)
    failure = Sources::ProcessingFailureBuilder.call(
      stage: :process,
      message: "Processing job failed: #{error.message}",
      details: failure_details(error)
    )

    Sources::MarkSelectionFailed.call(source_selection: source_selection, failure: failure)
    Sources::Lifecycle.call(source: source_selection.source, event: :selection_statuses_changed)
  end

  def failure_details(error)
    {
      code: "job_failed",
      error_class: error.class.name,
      backtrace: error.backtrace&.first(10)
    }
  end
end
