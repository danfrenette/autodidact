# frozen_string_literal: true

module Autodidact
  module Ingest
    class TextIngestor
      def self.call(path:, start_line: nil, end_line: nil)
        new(path: path, start_line: start_line, end_line: end_line).call
      end

      def initialize(path:, start_line: nil, end_line: nil)
        @path = path
        @start_line = start_line
        @end_line = end_line
      end

      def call
        lines = File.readlines(path, chomp: true)
        slice(lines).join("\n")
      end

      private

      attr_reader :path, :start_line, :end_line

      def slice(lines)
        return lines if start_line.nil? || end_line.nil?

        lines[(start_line - 1)..(end_line - 1)] || []
      end
    end
  end
end
