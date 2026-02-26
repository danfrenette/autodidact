# frozen_string_literal: true

module Autodidact
  module Convert
    class TextConverter < Command
      def call(path:, source_type:)
        raw_text = File.read(path)

        success(payload: ConversionResult.new(
          raw_text: raw_text,
          source_path: path,
          source_type: source_type,
          selection_kind: "full",
          selection_payload: {},
          note_filename: note_filename(path)
        ))
      end

      private

      def note_filename(path)
        timestamp = Time.now.strftime("%Y-%m-%d")
        basename = File.basename(path, ".*").gsub(/[^a-zA-Z0-9\-_]+/, "-")
        "#{timestamp}--#{basename}.md"
      end
    end
  end
end
