# frozen_string_literal: true

class SourceSelectionsController < ApplicationController
  def create
    source = current_user_sources.find(params[:source_id])
    result = Sources::SelectionCreation.new(source: source, params: selection_params).call

    if result.success?
      render_success(
        template: "source_selections/create",
        locals: {source_selection: result.selection},
        status: :created
      )
    else
      render_error(
        code: "validation_failed",
        message: "Selection could not be created",
        details: {errors: result.errors},
        status: :unprocessable_entity
      )
    end
  end

  def destroy
    source = current_user_sources.find(params[:source_id])
    selection = source.source_selections.find(params[:id])

    unless selection.pending?
      render_error(
        code: "conflict",
        message: "Only pending selections can be deleted",
        status: :conflict
      )
      return
    end

    selection.destroy!

    render_success(
      template: "source_selections/destroy",
      locals: {source_selection: selection}
    )
  end

  private

  def current_user_sources
    Source.where(user_id: current_user.id)
  end

  def selection_params
    params.require(:source_selection).permit(:kind, :subtype, :title, :label, position: {}, locator: {})
  end
end
