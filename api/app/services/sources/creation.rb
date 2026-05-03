# frozen_string_literal: true

module Sources
  class Creation
    Result = Data.define(:success?, :source, :errors)

    def initialize(user:, source_params:, selection_params: [])
      @user = user
      @source_params = source_params
      @selection_params = selection_params
    end

    def call
      source = build_source

      Source.transaction do
        source.save!
        create_selections(source)
      end

      Result.new(success?: true, source: source, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      Result.new(success?: false, source: source, errors: e.record.errors.full_messages)
    end

    private

    attr_reader :user, :source_params, :selection_params

    def build_source
      Source.new(source_params.merge(user_id: user.id, status: :uploading))
    end

    def create_selections(source)
      selection_params.each do |params|
        source.source_selections.create!(params)
      end
    end
  end
end
