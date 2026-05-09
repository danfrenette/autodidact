# frozen_string_literal: true

module Sources
  class ProcessSelections < ApplicationService
    Result = ApplicationResult.define(:source, :failures)

    def initialize(source:)
      @source = source
    end

    def call
      Source.transaction do
        reconciliation_result = reconcile_selections
        next failure_result(reconciliation_result.failures) if reconciliation_result.failure?

        lifecycle_result = Sources::Lifecycle.call(source: source, event: :processing_started)
        next failure(source: source, failures: [], errors: lifecycle_result.errors) if lifecycle_result.failure?

        process_reconciled_selections(reconciliation_result.resolved_selections)
        success(source: source, failures: [])
      end
    end

    private

    attr_reader :source

    def reconcile_selections
      SelectionReconciler.new(source: source).call
    end

    def failure_result(failures)
      failure(source: source, failures: failures)
    end

    def process_reconciled_selections(resolved_selections)
      resolved_selections.each { |resolved| confirm_and_enqueue(resolved) }
    end

    def confirm_and_enqueue(resolved)
      selection = resolved.fetch(:selection)
      confirm_selection(selection, resolved)
      enqueue_selection(selection)
    end

    def confirm_selection(selection, resolved)
      selection.update!(
        status: :confirmed,
        title: resolved.fetch(:title),
        label: resolved.fetch(:label),
        position: resolved.fetch(:position),
        locator: resolved.fetch(:locator),
        error_message: nil
      )
    end

    def enqueue_selection(selection)
      selection.update!(status: :queued)
      ProcessSourceSelectionJob.perform_later(selection.id)
    end
  end
end
