# frozen_string_literal: true

class ConceptsController < ApplicationController
  before_action :set_source_selection
  before_action :authorize_source_selection!

  def index
    @concepts = @source_selection.concepts.order(:created_at)
    render formats: :json
  end

  private

  def set_source_selection
    @source_selection = SourceSelection.find(params[:source_selection_id])
  end

  def authorize_source_selection!
    return if @source_selection.source.user_id == current_user.id

    head :not_found
  end
end
