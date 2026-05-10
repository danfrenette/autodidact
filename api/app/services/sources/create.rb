# frozen_string_literal: true

module Sources
  class Create < ApplicationService
    Result = ApplicationResult.define(:source)

    def initialize(user:, source_params:, selection_params: [], tag_names: [])
      @user = user
      @source_params = source_params
      @selection_params = selection_params
      @tag_names = tag_names
    end

    def call
      source = build_source

      Source.transaction do
        source.save!
        Sources::Lifecycle.call(source: source, event: :created)
        create_selections(source)
        create_tags(source)
      end

      success(source: source, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      failure(source: source, errors: e.record.errors.full_messages)
    end

    private

    attr_reader :user, :source_params, :selection_params, :tag_names

    def build_source
      Source.new(source_params.merge(user_id: user.id))
    end

    def create_selections(source)
      selection_params.each do |params|
        source.source_selections.create!(params)
      end
    end

    def create_tags(source)
      Tags::FindOrCreate.call(user: user, taggable: source, tag_names: tag_names)
    end
  end
end
