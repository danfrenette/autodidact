# frozen_string_literal: true

module Sources
  class Update < ApplicationService
    Result = ApplicationResult.define(:source)

    def initialize(source:, params:)
      @source = source
      @params = params
    end

    def call
      source.update!(params)

      success(source: source, errors: [])
    rescue ActiveRecord::RecordInvalid
      failure(source: source, errors: source.errors.full_messages)
    end

    private

    attr_reader :source, :params
  end
end
