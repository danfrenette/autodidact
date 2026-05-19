# frozen_string_literal: true

module Sources
  class AttachmentsController < ApplicationController
    def create
      source = Source.find(params[:source_id])
      result = Sources::AttachAsset.call(
        source: source,
        signed_blob_id: params.require(:signed_blob_id)
      )

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
          status: :unprocessable_content
        )
      end
    end
  end
end
