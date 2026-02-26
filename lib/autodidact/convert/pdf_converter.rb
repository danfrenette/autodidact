# frozen_string_literal: true

module Autodidact
  module Convert
    class PdfConverter < Command
      def call(path:, source_type:)
        raise StandardError, "PDF conversion not yet implemented"
      end
    end
  end
end
