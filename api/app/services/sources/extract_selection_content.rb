# frozen_string_literal: true

module Sources
  class ExtractSelectionContent < ApplicationService
    Result = ApplicationResult.define(:content, :error_message)

    def initialize(source_selection:)
      @source_selection = source_selection
    end

    def call
      source.asset.open do |file|
        extraction_result = extract_from_pdf(file.path)
        return failure(content: nil, error_message: extraction_result.error.message) if extraction_result.failure?

        content_record = persist_content(extraction_result.payload)
        success(content: content_record, error_message: nil)
      end
    rescue => e
      failure(content: nil, error_message: e.message)
    end

    private

    attr_reader :source_selection

    def source
      source_selection.source
    end

    def page_range
      source_selection.locator.start_page..source_selection.locator.end_page
    end

    def extract_from_pdf(path)
      pdf = Substrate::Sources::Pdf.new(path)
      page_collection = pdf.select_pages(page_range)
      Substrate::Distill.call(content: page_collection)
    end

    def persist_content(distilled_payload)
      text = distilled_payload.text
      page_range = distilled_payload.metadata[:pages_extracted]
      locator_spans = build_locator_spans(text, page_range)

      content = SourceSelectionContent.find_or_initialize_by(source_selection: source_selection)
      content.raw_text = text
      content.locator_spans = locator_spans
      content.save!

      content
    end

    def build_locator_spans(text, pages)
      [
        {
          "byte_start" => 0,
          "byte_end" => text.bytesize,
          "page_start" => pages.first,
          "page_end" => pages.last
        }
      ]
    end
  end
end
