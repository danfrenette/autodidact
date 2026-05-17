# frozen_string_literal: true

module Sources
  class ProcessSelections < ApplicationService
    Result = ApplicationResult.define(:source, :failures)

    def initialize(source:)
      @source = source
    end

    def call
      selections_to_enqueue = []

      result = Source.transaction do
        reconciliation_result = reconcile_selections
        next failure_result(reconciliation_result.failures) if reconciliation_result.failure?

        lifecycle_result = Sources::Lifecycle.call(source: source, event: :processing_started)
        next failure(source: source, failures: [], errors: lifecycle_result.errors) if lifecycle_result.failure?

        selections_to_enqueue = process_reconciled_selections(reconciliation_result.resolved_selections)
        success(source: source, failures: [])
      end

      enqueue_selections(selections_to_enqueue) if result.success?

      result
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
      resolved_selections.map { |resolved| confirm_selection_for_processing(resolved) }
    end

    def confirm_selection_for_processing(resolved)
      selection = resolved.fetch(:selection)
      confirm_selection(selection, resolved)
      mark_queued(selection)
      selection
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

    def mark_queued(selection)
      selection.update!(status: :queued)
    end

    def enqueue_selections(selections)
      selections.each { |selection| ProcessSourceSelectionJob.perform_later(selection.id) }
    end
  end
end
