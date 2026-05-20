# frozen_string_literal: true

module Sources
  class RetryProcessing < ApplicationService
    Result = ApplicationResult.define(:source)

    def initialize(source:)
      @source = source
    end

    def call
      return cannot_retry unless source.failed? && failed_selection_ids.any?

      result = reset_source_and_selections
      return result if result.failure?

      enqueue_failed_selections
      success(source: source)
    end

    private

    attr_reader :source

    def cannot_retry
      errors = []
      errors << "Source must be failed before retrying" unless source.failed?
      errors << "No failed selections to retry" if failed_selection_ids.empty?

      failure(source: source, errors: errors)
    end

    def reset_source_and_selections
      Source.transaction do
        lifecycle_result = Sources::Lifecycle.call(source: source, event: :retry_started)
        next failure(source: source, errors: lifecycle_result.errors) if lifecycle_result.failure?

        reset_failed_selections
        success(source: source)
      end
    end

    def reset_failed_selections
      source.source_selections.where(id: failed_selection_ids).update_all(
        status: :queued,
        pipeline_stage: nil,
        error_message: nil,
        error_details: {},
        updated_at: Time.current
      )
    end

    def enqueue_failed_selections
      ActiveRecord.after_all_transactions_commit do
        failed_selection_ids.each { |selection_id| ProcessSourceSelectionJob.perform_later(selection_id) }
      end
    end

    def failed_selection_ids
      @failed_selection_ids ||= source.source_selections.failed.ids
    end
  end
end
