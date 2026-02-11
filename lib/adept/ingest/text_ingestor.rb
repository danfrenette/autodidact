# frozen_string_literal: true

module Adept
  module Ingest
    class TextIngestor
      def call(path:, start_line: nil, end_line: nil)
        lines = File.readlines(path, chomp: true)

        slice(lines, start_line, end_line).join("\n")
      end

      private

      def slice(lines, start_line, end_line)
        return lines if start_line.nil? || end_line.nil?

        lines[(start_line - 1)..(end_line - 1)] || []
      end
    end
  end
end
