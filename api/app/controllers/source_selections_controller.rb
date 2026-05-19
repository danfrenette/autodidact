# frozen_string_literal: true

class SourceSelectionsController < ApplicationController
  def show
    selection = SourceSelection.includes(:tags, :concepts, :quotes, :questions, source: :tags).find(params[:id])
    return head :not_found unless selection.source.user_id == current_user.id

    render_success(
      template: "source_selections/show",
      locals: {source_selection: selection}
    )
  end

  def create
    source = current_user_sources.find(params[:source_id])
    result = Sources::CreateSelection.call(source: source, params: selection_params)

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
        status: :unprocessable_content
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
