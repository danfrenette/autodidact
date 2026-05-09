# frozen_string_literal: true

module Sources
  class ExtractSelectionContent < ApplicationService
    Result = ApplicationResult.define(:error_message)

    def initialize(source_selection:)
      @source_selection = source_selection
    end

    def call
      source.asset.open do |file|
        pdf = Substrate::Sources::Pdf.new(file.path)
        result = Substrate::Distill.call(content: pdf.select_pages(page_range))

        return failure(error_message: result.error.message) if result.failure?
      end

      success(error_message: nil)
    rescue => e
      failure(error_message: e.message)
    end

    private

    attr_reader :source_selection

    def source
      source_selection.source
    end

    def page_range
      source_selection.locator.start_page..source_selection.locator.end_page
    end
  end
end
