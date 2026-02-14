# frozen_string_literal: true

module Autodidact
  module Commands
    class DetectSource
      EXTENSION_MAP = {
        ".txt" => "text",
        ".md" => "text",
        ".rst" => "text",
        ".pdf" => "pdf"
      }.freeze

      def call(params:, notify:)
        Autodidact::Debug.remote_pry(binding)

        path = params.fetch(:path)

        raise ArgumentError, "File not found: #{path}" unless File.exist?(path)

        source_type = detect_type(path)
        raise ArgumentError, "Unsupported file type: #{File.extname(path)}" unless source_type

        {
          path: path,
          source_type: source_type,
          metadata: build_metadata(path, source_type)
        }
      end

      private

      def detect_type(path)
        ext = File.extname(path).downcase
        EXTENSION_MAP[ext]
      end

      def build_metadata(path, source_type)
        case source_type
        when "text"
          {line_count: File.foreach(path).count}
        when "pdf"
          {file_size: File.size(path)}
        else
          {}
        end
      end
    end
  end
end
