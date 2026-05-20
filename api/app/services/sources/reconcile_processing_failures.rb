# frozen_string_literal: true

module Sources
  class ReconcileProcessingFailures < ApplicationService
    Result = ApplicationResult.define(:count)

    STUCK_STATUSES = %w[queued processing].freeze

    def initialize(source: nil, failed_executions: nil)
      @source = source
      @failed_executions = failed_executions
    end

    def call
      failed_selection_ids = failed_job_selection_ids & stuck_selection_ids
      mark_failed(failed_selection_ids)
      refresh_sources(failed_selection_ids)

      success(count: failed_selection_ids.size)
    end

    private

    attr_reader :source, :failed_executions

    def failed_job_selection_ids
      queue_failed_executions.filter_map do |execution|
        job = execution.job
        next unless job.class_name == "ProcessSourceSelectionJob"

        job.arguments.fetch("arguments").first
      end
    end

    def queue_failed_executions
      failed_executions || SolidQueue::FailedExecution.includes(:job)
    end

    def stuck_selection_ids
      selection_scope.pluck(:id)
    end

    def selection_scope
      scope = SourceSelection.where(status: STUCK_STATUSES)
      source ? scope.where(source: source) : scope
    end

    def mark_failed(selection_ids)
      return if selection_ids.empty?

      SourceSelection.where(id: selection_ids).update_all(
        status: :failed,
        pipeline_stage: nil,
        error_message: "Processing job failed before completion",
        error_details: {
          stage: Sources::ProcessSelection::STAGES.fetch(:process),
          message: "Processing job failed before completion",
          code: "job_failed",
          action: "retry"
        },
        updated_at: Time.current
      )
    end

    def refresh_sources(selection_ids)
      SourceSelection.where(id: selection_ids).select(:source_id).distinct.pluck(:source_id).each do |source_id|
        Sources::Lifecycle.call(source: Source.find(source_id), event: :selection_statuses_changed)
      end
    end
  end
end
