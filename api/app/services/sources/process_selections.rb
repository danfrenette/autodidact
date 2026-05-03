# frozen_string_literal: true

module Sources
  class ProcessSelections
    Result = Data.define(:success?, :source, :failures)

    def initialize(source:)
      @source = source
    end

    def call
      reconciliation_result = reconcile_selections
      return failure_result(reconciliation_result.failures) unless reconciliation_result.success?

      process_reconciled_selections(reconciliation_result.resolved_selections)
      Result.new(success?: true, source: source, failures: [])
    end

    private

    attr_reader :source

    def reconcile_selections
      SelectionReconciler.new(source: source).call
    end

    def failure_result(failures)
      Result.new(success?: false, source: source, failures: failures)
    end

    def process_reconciled_selections(resolved_selections)
      Source.transaction do
        resolved_selections.each { |resolved| confirm_and_enqueue(resolved) }
        transition_source_to_processing
      end
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

    def transition_source_to_processing
      source.update!(status: :processing)
    end
  end
end
