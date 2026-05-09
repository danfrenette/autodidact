# frozen_string_literal: true

module Sources
  class ProcessSelection < ApplicationService
    Result = ApplicationResult.define(:error_message)

    def initialize(source_selection:)
      @source_selection = source_selection
    end

    def call
      ActiveRecord::Base.transaction do
        transition_to_processing
        result = extract_content
        next result if result.failure?

        mark_complete
        refresh_source_status
        success(error_message: nil)
      end
    end

    private

    attr_reader :source_selection

    def source
      source_selection.source
    end

    def transition_to_processing
      source_selection.update!(status: :processing)
    end

    def extract_content
      result = Sources::ExtractSelectionContent.call(source_selection: source_selection)
      return fail_processing(result.error_message) if result.failure?

      result
    end

    def fail_processing(message)
      mark_failed(message)
      refresh_source_status
      failure(error_message: message)
    end

    def mark_complete
      source_selection.update!(status: :complete, error_message: nil)
    end

    def mark_failed(message)
      source_selection.update!(status: :failed, error_message: message)
    end

    def refresh_source_status
      Sources::Lifecycle.call(source: source, event: :selection_statuses_changed)
    end
  end
end
