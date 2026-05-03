# frozen_string_literal: true

class SourceAttachmentsController < ApplicationController
  def create
    source = current_user_sources.find(params[:source_id])
    result = Sources::AttachmentCreation.new(source: source, signed_blob_id: params.require(:signed_blob_id)).call

    if result.success?
      render_success(
        template: "source_attachments/create",
        locals: {source: result.source},
        status: :created
      )
    else
      render_error(
        code: "validation_failed",
        message: "Attachment could not be created",
        details: {errors: result.errors},
        status: :unprocessable_entity
      )
    end
  end

  private

  def current_user_sources
    Source.where(user_id: current_user.id)
  end
end
