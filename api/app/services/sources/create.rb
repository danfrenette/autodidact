# frozen_string_literal: true

module Sources
  class Create < ApplicationService
    ProviderAvailabilityError = Class.new(StandardError)

    Result = ApplicationResult.define(:source, :error_code, :error_message, :error_details)

    def initialize(user:, source_params:, selection_params: [], tag_names: [], signed_blob_id: nil)
      @user = user
      @source_params = source_params
      @selection_params = selection_params
      @tag_names = tag_names
      @signed_blob_id = signed_blob_id
    end

    def call
      verify_availability!

      source = build_source

      Source.transaction do
        source.save!
        Sources::Lifecycle.call(source: source, event: :created)
        create_selections(source)
        create_tags(source)
        attach_asset(source)
        process_selections(source)
      end

      success(source: source, error_code: nil, error_message: nil, error_details: {}, errors: [])
    rescue ProviderAvailabilityError => e
      failure(
        source: nil,
        error_code: "providers_required",
        error_message: e.message,
        error_details: {missing_roles: availability.missing_roles},
        errors: [e.message]
      )
    rescue ActiveRecord::RecordInvalid => e
      failure(
        source: source,
        error_code: "validation_failed",
        error_message: "Source could not be created",
        error_details: {errors: e.record.errors.full_messages},
        errors: e.record.errors.full_messages
      )
    end

    private

    attr_reader :user, :source_params, :selection_params, :tag_names, :signed_blob_id, :availability

    def build_source
      Source.new(source_params.merge(user_id: user.id))
    end

    def verify_availability!
      @availability = ProviderRoleSettings::Availability.call(user: user)
      return if availability.available

      raise ProviderAvailabilityError, "Connect #{availability.missing_roles.to_sentence} providers before adding sources"
    end

    def create_selections(source)
      selection_params.each do |params|
        tag_names = params.delete(:tags) || []
        selection = source.source_selections.create!(params)

        Tags::FindOrCreate.call(user: user, taggable: selection, tag_names: tag_names)
      end
    end

    def create_tags(source)
      Tags::FindOrCreate.call(user: user, taggable: source, tag_names: tag_names)
    end

    def attach_asset(source)
      result = Sources::AttachAsset.call(source: source, signed_blob_id: signed_blob_id)
      raise ActiveRecord::RecordInvalid, source if result.failure?
    end

    def process_selections(source)
      result = Sources::ProcessSelections.call(source: source)
      raise ActiveRecord::RecordInvalid, source if result.failure?
    end
  end
end
