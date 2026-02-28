# frozen_string_literal: true

module Autodidact
  module Convert
    class TextConverter < Command
      def initialize(path:, source_type:)
        @path = path
        @source_type = source_type
      end

      def call
        raw_text = File.read(path)

        success(payload: ConversionResult.new(
          raw_text: raw_text,
          source_path: path,
          source_type: source_type,
          selection_kind: "full",
          selection_payload: {},
          note_filename: note_filename
        ))
      end

      private

      attr_reader :path, :source_type

      def note_filename
        NoteFilename.new(path: path).call
      end
    end
  end
end
