# frozen_string_literal: true

module Sources
  class RetriesController < ApplicationController
    def create
      source = Source.find(params[:source_id])
      result = Sources::RetryProcessing.call(source: source)

      if result.success?
        render_success(
          template: "source_retries/create",
          locals: {source: source.reload}
        )
      else
        render_error(
          code: "source_retry_failed",
          message: result.errors.to_sentence,
          details: {errors: result.errors},
          status: :unprocessable_content
        )
      end
    end
  end
end
