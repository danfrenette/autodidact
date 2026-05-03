# frozen_string_literal: true

module Sources
  class RefreshStatus
    def initialize(source:)
      @source = source
    end

    def call
      update_status(determine_status)
    end

    private

    attr_reader :source

    def determine_status
      return :uploaded if source.source_selections.empty?

      statuses = source.source_selections.pluck(:status)

      if statuses.all? { |status| status == "complete" }
        :complete
      elsif statuses.any? { |status| status == "failed" }
        :failed
      elsif statuses.any? { |status| %w[queued processing confirmed].include?(status) }
        :processing
      else
        :uploaded
      end
    end

    def update_status(new_status)
      source.update!(status: new_status)
    end
  end
end
