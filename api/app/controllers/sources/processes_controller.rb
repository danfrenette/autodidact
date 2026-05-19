# frozen_string_literal: true

module Sources
  class ProcessesController < ApplicationController
    def create
      source = Source.find(params[:source_id])
      result = Sources::ProcessSelections.call(source: source)

      if result.success?
        render_success(
          template: "source_processes/create",
          locals: {source: source.reload}
        )
      else
        render_error(
          code: "selection_reconciliation_failed",
          message: "Some selected chapters could not be matched to the uploaded PDF.",
          details: {errors: result.errors, failures: result.failures},
          status: :unprocessable_content
        )
      end
    end
  end
end
