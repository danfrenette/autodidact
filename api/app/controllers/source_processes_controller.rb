# frozen_string_literal: true

class SourceProcessesController < ApplicationController
  def create
    source = current_user_sources.find(params[:source_id])
    result = Sources::ProcessSelections.new(source: source).call

    if result.success?
      render json: {ok: true, source_id: source.id, status: source.reload.status}
    else
      render json: {
        ok: false,
        code: "selection_reconciliation_failed",
        message: "Some selected chapters could not be matched to the uploaded PDF.",
        failures: result.failures
      }, status: :unprocessable_entity
    end
  end

  private

  def current_user_sources
    Source.where(user_id: current_user.id)
  end
end
