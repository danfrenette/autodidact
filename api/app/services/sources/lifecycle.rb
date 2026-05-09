# frozen_string_literal: true

module Sources
  class Lifecycle < ApplicationService
    Result = ApplicationResult.define(:source)

    PROCESSING_SELECTION_STATUSES = %w[queued processing confirmed].freeze

    ALLOWED_TRANSITIONS = {
      created: {"draft" => %w[uploading]},
      asset_attached: {"uploading" => %w[uploaded]},
      processing_started: {"uploaded" => %w[processing]},
      selection_statuses_changed: {
        "uploaded" => %w[uploaded],
        "processing" => %w[processing complete failed],
        "complete" => %w[complete],
        "failed" => %w[failed]
      }
    }.freeze

    def initialize(source:, event:)
      @source = source
      @event = event.to_sym
    end

    def call
      return unknown_event unless known_event?

      status = next_status
      return invalid_transition(status) unless transition_allowed?(status)

      transition_to(status)
      success(source: source)
    end

    private

    attr_reader :source, :event

    def known_event?
      ALLOWED_TRANSITIONS.key?(event)
    end

    def next_status
      case event
      when :created then "uploading"
      when :asset_attached then "uploaded"
      when :processing_started then "processing"
      when :selection_statuses_changed then status_from_selections
      end
    end

    def status_from_selections
      return "uploaded" if selection_statuses.empty?
      return "complete" if selection_statuses.all? { |status| status == "complete" }
      return "failed" if selection_statuses.any? { |status| status == "failed" }
      return "processing" if selection_statuses.any? { |status| PROCESSING_SELECTION_STATUSES.include?(status) }

      "uploaded"
    end

    def transition_allowed?(next_status)
      allowed_statuses = ALLOWED_TRANSITIONS.fetch(event).fetch(source.status, [])
      allowed_statuses.include?(next_status)
    end

    def transition_to(status)
      source.update!(status: status)
    end

    def invalid_transition(next_status)
      failure(source: source, errors: ["Cannot transition source from #{source.status} to #{next_status} for #{event}"])
    end

    def unknown_event
      failure(source: source, errors: ["Unknown source lifecycle event: #{event}"])
    end

    def selection_statuses
      @selection_statuses ||= source.source_selections.pluck(:status)
    end
  end
end
