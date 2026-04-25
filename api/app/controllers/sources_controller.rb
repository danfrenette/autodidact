# frozen_string_literal: true

class SourcesController < ApplicationController
  def create
    result = Sources::Creation.new(user: current_user, params: source_params).call

    if result.success?
      render json: serialize_source(result.source), status: :created
    else
      render json: {errors: result.errors}, status: :unprocessable_entity
    end
  end

  def update
    source = current_user_sources.find(params[:id])
    result = Sources::Update.new(source: source, params: update_source_params).call

    if result.success?
      render json: serialize_source(result.source)
    else
      render json: {errors: result.errors}, status: :unprocessable_entity
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

  def serialize_source(source)
    {
      id: source.id,
      title: source.title,
      kind: source.kind,
      original_filename: source.original_filename,
      status: source.status,
      asset_attached: source.asset.attached?
    }
  end
end
