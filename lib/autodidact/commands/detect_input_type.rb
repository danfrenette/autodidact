# frozen_string_literal: true

module Autodidact
  module Commands
    class DetectInputType < Command
      URL_PATTERN = %r{\Ahttps?://\S+\z}
      PATH_PATTERN = %r{[/\\]|\.[a-z0-9]{1,5}\z}i
      def initialize(input:)
        @input = input
      end

      def call
        success(payload: {
          input_type: classify(input)
        })
      end

      private

      attr_reader :input

      def classify(input)
        value = input.to_s.strip
        return "url" if value.match?(URL_PATTERN)
        return "file_path" if value.match?(PATH_PATTERN)

        "raw_text"
      end
    end
  end
end
