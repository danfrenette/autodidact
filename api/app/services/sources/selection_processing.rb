# frozen_string_literal: true

module Sources
  class SelectionProcessing
    Result = Data.define(:success?, :error_message)

    def initialize(source_selection:)
      @source_selection = source_selection
    end

    def call
      ActiveRecord::Base.transaction do
        transition_to_processing
        extract_content
        mark_complete
      end

      refresh_source_status
      Result.new(success?: true, error_message: nil)
    rescue => e
      mark_failed(e.message)
      refresh_source_status
      raise
    end

    private

    attr_reader :source_selection

    def source
      source_selection.source
    end

    def transition_to_processing
      source_selection.update!(status: :processing)
    end

    def extract_content
      source.asset.open do |file|
        pdf = Substrate::Sources::Pdf.new(file.path)
        range = source_selection.locator.fetch("start")..source_selection.locator.fetch("end")
        result = Substrate::Distill.call(content: pdf.select_pages(range))

        raise result.error if result.failure?
      end
    end

    def mark_complete
      source_selection.update!(status: :complete, error_message: nil)
    end

    def mark_failed(message)
      source_selection.update!(status: :failed, error_message: message)
    end

    def refresh_source_status
      Sources::RefreshStatus.new(source: source).call
    end
  end
end
