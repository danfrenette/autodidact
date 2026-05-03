# frozen_string_literal: true

module Sources
  class SelectionCreation
    Result = Data.define(:success?, :selection, :errors)

    def initialize(source:, params:)
      @source = source
      @params = params
    end

    def call
      selection = build_selection
      selection.save!

      Result.new(success?: true, selection: selection, errors: [])
    rescue ActiveRecord::RecordInvalid
      Result.new(success?: false, selection: selection, errors: selection.errors.full_messages)
    end

    private

    attr_reader :source, :params

    def build_selection
      source.source_selections.new(params)
    end
  end
end
