# frozen_string_literal: true

module Sources
  class AttachAsset < ApplicationService
    Result = ApplicationResult.define(:source)

    def initialize(source:, signed_blob_id:)
      @source = source
      @signed_blob_id = signed_blob_id
    end

    def call
      Source.transaction do
        lifecycle_result = Sources::Lifecycle.call(source: source, event: :asset_attached)
        next lifecycle_result if lifecycle_result.failure?

        attach_asset
        update_source_metadata

        success(source: source, errors: [])
      end
    rescue ActiveRecord::RecordInvalid => e
      failure(source: source, errors: source.errors.full_messages.presence || [e.message])
    end

    private

    attr_reader :source, :signed_blob_id

    def attach_asset
      source.asset.attach(signed_blob_id)
    end

    def update_source_metadata
      source.update!(
        original_filename: source.asset.filename.to_s
      )
    end
  end
end
