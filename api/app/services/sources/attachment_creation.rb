# frozen_string_literal: true

module Sources
  class AttachmentCreation
    Result = Data.define(:success?, :source, :errors)

    def initialize(source:, signed_blob_id:)
      @source = source
      @signed_blob_id = signed_blob_id
    end

    def call
      attach_asset
      update_source_metadata

      Result.new(success?: true, source: source, errors: [])
    rescue ActiveRecord::RecordInvalid
      Result.new(success?: false, source: source, errors: source.errors.full_messages)
    end

    private

    attr_reader :source, :signed_blob_id

    def attach_asset
      source.asset.attach(signed_blob_id)
    end

    def update_source_metadata
      source.update!(
        status: :uploaded,
        original_filename: source.asset.filename.to_s
      )
    end
  end
end
