# frozen_string_literal: true

module Sources
  class ProcessingFailureBuilder < ApplicationService
    PROVIDER_SETTINGS_CODES = %w[quota_exceeded invalid_api_key provider_not_configured].freeze

    def initialize(stage:, message:, details: {})
      @stage = stage
      @message = message
      @details = (details || {}).stringify_keys
    end

    def call
      ProcessingFailure.new(
        stage: stage_name,
        message: message,
        code: code,
        action: action,
        details: details
      )
    end

    private

    attr_reader :stage, :message, :details

    def stage_name
      ProcessSelection::STAGES.fetch(stage)
    end

    def code
      @code ||= (details["code"] || default_code).to_s
    end

    def action
      PROVIDER_SETTINGS_CODES.include?(code) ? "provider_settings" : "retry"
    end

    def default_code
      case stage
      when :write then "write_failed"
      when :analyze then "analysis_output_invalid"
      when :process then "pipeline_error"
      else "pipeline_error"
      end
    end
  end
end
