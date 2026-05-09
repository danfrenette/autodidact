# frozen_string_literal: true

module Sources
  class CreateSelection < ApplicationService
    Result = ApplicationResult.define(:selection)

    def initialize(source:, params:)
      @source = source
      @params = params
    end

    def call
      selection = build_selection
      selection.save!

      success(selection: selection, errors: [])
    rescue ActiveRecord::RecordInvalid
      failure(selection: selection, errors: selection.errors.full_messages)
    end

    private

    attr_reader :source, :params

    def build_selection
      source.source_selections.new(params)
    end
  end
end
