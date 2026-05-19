# frozen_string_literal: true

module Sources
  class SelectionsController < ApplicationController
    def create
      source = Source.find(params[:source_id])
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
      source = Source.find(params[:source_id])
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

    def selection_params
      params.require(:source_selection).permit(:kind, :subtype, :title, :label, position: {}, locator: {})
    end
  end
end
