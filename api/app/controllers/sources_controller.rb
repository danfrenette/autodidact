# frozen_string_literal: true

class SourcesController < ApplicationController
  def create
    result = Sources::Creation.new(user: current_user, params: source_params).call

    if result.success?
      render_success(
        template: "sources/create",
        locals: {source: result.source},
        status: :created
      )
    else
      render_error(
        code: "validation_failed",
        message: "Source could not be created",
        details: {errors: result.errors},
        status: :unprocessable_entity
      )
    end
  end

  def update
    source = current_user_sources.find(params[:id])
    result = Sources::Update.new(source: source, params: update_source_params).call

    if result.success?
      render_success(
        template: "sources/update",
        locals: {source: result.source}
      )
    else
      render_error(
        code: "validation_failed",
        message: "Source could not be updated",
        details: {errors: result.errors},
        status: :unprocessable_entity
      )
    end
  end

  private

  def current_user_sources
    Source.where(user_id: current_user.id)
  end

  def source_params
    params.require(:source).permit(:title, :kind, :original_filename)
  end

  def update_source_params
    params.require(:source).permit(:title)
  end
end
