# frozen_string_literal: true

module Sources
  class Update
    Result = Data.define(:success?, :source, :errors)

    def initialize(source:, params:)
      @source = source
      @params = params
    end

    def call
      source.update!(params)

      Result.new(success?: true, source: source, errors: [])
    rescue ActiveRecord::RecordInvalid
      Result.new(success?: false, source: source, errors: source.errors.full_messages)
    end

    private

    attr_reader :source, :params
  end
end
