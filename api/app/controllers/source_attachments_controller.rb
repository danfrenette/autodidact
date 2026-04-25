# frozen_string_literal: true

class SourceAttachmentsController < ApplicationController
  def create
    source = current_user_sources.find(params[:source_id])
    result = Sources::AttachmentCreation.new(source: source, signed_blob_id: params.require(:signed_blob_id)).call

    if result.success?
      render json: serialize_attachment(result.source), status: :created
    else
      render json: {errors: result.errors}, status: :unprocessable_entity
    end
  end

  private

  def current_user_sources
    Source.where(user_id: current_user.id)
  end

  def serialize_attachment(source)
    {
      id: source.id,
      status: source.status,
      original_filename: source.original_filename,
      asset_attached: source.asset.attached?
    }
  end
end
