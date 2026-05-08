# frozen_string_literal: true

module Sources
  class RefreshStatus < ApplicationService
    def initialize(source:)
      @source = source
    end

    def call
      source.update!(status: next_status)
    end

    private

    attr_reader :source

    def next_status
      return :uploaded if no_selections?
      return :complete if all_selections_complete?
      return :failed if any_selection_failed?
      return :processing if any_selection_processing?

      :uploaded
    end

    def no_selections?
      selection_statuses.empty?
    end

    def all_selections_complete?
      selection_statuses.all? { |status| status == "complete" }
    end

    def any_selection_failed?
      selection_statuses.any? { |status| status == "failed" }
    end

    def any_selection_processing?
      selection_statuses.any? { |status| %w[queued processing confirmed].include?(status) }
    end

    def selection_statuses
      @selection_statuses ||= source.source_selections.pluck(:status)
    end
  end
end
