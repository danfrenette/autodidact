# frozen_string_literal: true

require "digest"
require "hexapdf"

module Autodidact
  class PdfDocument
    def initialize(path)
      @path = path
    end

    def chapters
      items = []
      doc.outline.each_item do |item, _level|
        title = item[:Title]
        page = page_number_for(item)
        items << {id: chapter_id(title, page), title: title, page: page} if title && !title.empty? && page
      end
      items
    end

    def page_count
      doc.pages.count
    end

    def page_text(number)
      page = doc.pages[number - 1]
      return "" unless page

      extractor = Pdf::TextExtractor.new(page.resources)
      page.process_contents(extractor)
      extractor.text
    end

    def pages_text(range)
      range.map { |n| page_text(n) }.reject(&:empty?).join("\n\n")
    end

    private

    attr_reader :path

    def doc
      @doc ||= HexaPDF::Document.open(path)
    end

    def page_number_for(item)
      dest = item.destination || action_destination(item)
      return unless dest

      page_obj = dest.first
      doc.pages.each_with_index do |page, index|
        return index + 1 if page == page_obj
      end
      nil
    end

    def action_destination(item)
      action = item[:A]
      return unless action.is_a?(HexaPDF::Dictionary) && action[:S] == :GoTo

      action[:D]
    end

    def chapter_id(title, page)
      Digest::SHA256.hexdigest("#{page}:#{title}")[0, 8]
    end
  end
end
