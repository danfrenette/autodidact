# frozen_string_literal: true

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

      def call(params:, notify:)
        path = normalize_path(params.fetch(:path))
        validate_path!(path)
        source_type = detect_type!(path)

        success(payload: {
          path: path,
          source_type: source_type,
          metadata: build_metadata(path, source_type)
        })
      end

      private

      def normalize_path(path)
        File.expand_path(path)
      end

      def validate_path!(path)
        raise FileNotFound, "File not found: #{path}" unless File.file?(path)
      end

      def detect_type!(path)
        ext = File.extname(path).downcase
        EXTENSION_MAP.fetch(ext) do
          raise UnsupportedFileType, "Unsupported file type: #{ext}"
        end
      end

      def build_metadata(path, source_type)
        case source_type
        when "text" then text_metadata(path)
        when "pdf" then pdf_metadata(path)
        else {}
        end
      end

      def text_metadata(path)
        {line_count: File.foreach(path).count}
      end

      def pdf_metadata(path)
        {file_size: File.size(path)}
      end
    end
  end
end
