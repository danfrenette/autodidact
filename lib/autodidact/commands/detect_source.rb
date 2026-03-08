# frozen_string_literal: true

require "shellwords"

module Autodidact
  module Commands
    class DetectSource < Command
      class FileNotFound < StandardError; end
      class UnsupportedFileType < StandardError; end
      EXTENSION_MAP = {
        ".txt" => "text",
        ".md" => "text",
        ".rst" => "text",
        ".pdf" => "pdf"
      }.freeze

      def initialize(path:)
        @path = normalize_path(path)
      end

      def call
        validate_path!
        source_type = detect_type!
        success(payload: {
          path: path,
          source_type: source_type,
          metadata: build_metadata(source_type)
        })
      end

      private

      attr_reader :path

      def normalize_path(path)
        File.expand_path(shell_unescaped_path(path.to_s.strip) || path)
      end

      def shell_unescaped_path(raw_path)
        parts = Shellwords.shellsplit(raw_path)
        return if parts.length != 1

        parts.first
      rescue ArgumentError
        nil
      end

      def validate_path!
        raise FileNotFound, "File not found: #{path}" unless File.file?(path)
      end

      def detect_type!
        ext = File.extname(path).downcase
        EXTENSION_MAP.fetch(ext) do
          raise UnsupportedFileType, "Unsupported file type: #{ext}"
        end
      end

      def build_metadata(source_type)
        case source_type
        when "text" then text_metadata
        when "pdf" then pdf_metadata
        else {}
        end
      end

      def text_metadata
        {line_count: File.foreach(path).count}
      end

      def pdf_metadata
        {file_size: File.size(path)}
      end
    end
  end
end
