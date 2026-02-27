# frozen_string_literal: true

module Autodidact
  module Convert
    class PdfConverter < Command
      def initialize(path:, source_type:)
        @path = path
        @source_type = source_type
      end

      def call
        raise StandardError, "PDF conversion not yet implemented"
      end

      private

      attr_reader :path, :source_type
    end
  end
end
