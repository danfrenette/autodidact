# frozen_string_literal: true

class SourceSelectionsController < ApplicationController
  def create
    source = current_user_sources.find(params[:source_id])
    result = Sources::SelectionCreation.new(source: source, params: selection_params).call

    if result.success?
      render json: serialize_selection(result.selection), status: :created
    else
      render json: {errors: result.errors}, status: :unprocessable_entity
    end
  end

  def destroy
    source = current_user_sources.find(params[:source_id])
    selection = source.source_selections.find(params[:id])

    unless selection.pending?
      render json: {error: "Only pending selections can be deleted"}, status: :conflict
      return
    end

    selection.destroy!
    head :no_content
  end

  private

  def current_user_sources
    Source.where(user_id: current_user.id)
  end

  def selection_params
    params.require(:source_selection).permit(:kind, :subtype, :title, :label, position: {}, locator: {})
  end

  def serialize_selection(selection)
    {
      id: selection.id,
      source_id: selection.source_id,
      kind: selection.kind,
      subtype: selection.subtype,
      status: selection.status,
      title: selection.title,
      label: selection.label,
      position: selection.position,
      locator: selection.locator
    }
  end
end
