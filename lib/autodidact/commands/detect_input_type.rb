# frozen_string_literal: true

module Autodidact
  module Commands
    class DetectInputType < Query
      URL_PATTERN = %r{\Ahttps?://\S+\z}

      def initialize(input:)
        @input = input.to_s.strip
      end

      def call
        success(payload: {
          input_type: classify
        })
      end

      private

      attr_reader :input

      def classify
        return "raw_text" if input.include?("\n")
        return "url" if input.match?(URL_PATTERN)
        return "file_path" if File.exist?(input)

        "raw_text"
      end
    end
  end
end
