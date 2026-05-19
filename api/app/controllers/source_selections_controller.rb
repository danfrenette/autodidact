# frozen_string_literal: true

class SourceSelectionsController < ApplicationController
  def show
    selection = SourceSelection.includes(:tags, :concepts, :quotes, :questions, source: :tags).find(params[:id])

    render_success(
      template: "source_selections/show",
      locals: {source_selection: selection}
    )
  end
end
