# frozen_string_literal: true

module Sources
  class MarkSelectionFailed < ApplicationService
    Result = ApplicationResult.define(:source_selection)

    def initialize(source_selection:, failure:)
      @source_selection = source_selection
      @failure = failure
    end

    def call
      source_selection.update_columns(
        status: :failed,
        pipeline_stage: nil,
        error_message: failure.message,
        error_details: failure.error_details,
        updated_at: Time.current
      )

      success(source_selection: source_selection)
    end

    private

    attr_reader :source_selection, :failure
  end
end
