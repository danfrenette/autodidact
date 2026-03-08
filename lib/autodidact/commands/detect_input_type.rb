# frozen_string_literal: true

require "shellwords"

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
        return "file_path" if existing_path

        "raw_text"
      end

      def existing_path
        candidates.find { |candidate| File.file?(candidate) }
      end

      def candidates
        [input, shell_unescaped_input].compact.uniq
      end

      def shell_unescaped_input
        parts = Shellwords.shellsplit(input)
        return if parts.length != 1

        parts.first
      rescue ArgumentError
        nil
      end
    end
  end
end
