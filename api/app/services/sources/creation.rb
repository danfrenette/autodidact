# frozen_string_literal: true

module Sources
  class Creation
    Result = Data.define(:success?, :source, :errors)

    def initialize(user:, params:)
      @user = user
      @params = params
    end

    def call
      source = build_source
      source.save!

      Result.new(success?: true, source: source, errors: [])
    rescue ActiveRecord::RecordInvalid
      Result.new(success?: false, source: source, errors: source.errors.full_messages)
    end

    private

    attr_reader :user, :params

    def build_source
      Source.new(params.merge(user_id: user.id, status: :uploading))
    end
  end
end
