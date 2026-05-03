# frozen_string_literal: true

module Sources
  class Inspector
    def initialize(file_path:, kind: "pdf")
      @file_path = file_path
      @kind = kind
    end

    def call
      case kind
      when "pdf"
        inspect_pdf
      else
        raise NotImplementedError, "Inspection not implemented for kind: #{kind}"
      end
    end

    private

    attr_reader :file_path, :kind

    def inspect_pdf
      pdf = Substrate::Sources::Pdf.new(file_path)

      {
        metadata: {
          page_count: pdf.page_count
        },
        subsections: pdf.chapters.each_with_index.map do |chapter, index|
          {
            id: chapter.id,
            kind: "chapter",
            title: chapter.title,
            label: format("%02d", index + 1),
            position: {
              ordinal: index + 1
            },
            locator: {
              type: "page_range",
              start: chapter.pages.begin,
              end: chapter.pages.end
            }
          }
        end
      }
    end
  end
end
