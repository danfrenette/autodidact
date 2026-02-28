# frozen_string_literal: true

require "hexapdf"

module Autodidact
  module Pdf
    # Minimal HexaPDF content stream processor that collects plain text from a page.
    class TextExtractor < HexaPDF::Content::Processor
      attr_reader :text

      def initialize(resources)
        super
        @text = +""
      end

      def show_text(str)
        @text << decode_text(str) << " "
      end

      def show_text_with_positioning(arr)
        @text << decode_text(arr) << " "
      end
    end
  end
end
