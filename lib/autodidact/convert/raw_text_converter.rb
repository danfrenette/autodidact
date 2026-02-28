# frozen_string_literal: true

module Autodidact
  module Convert
    class RawTextConverter < Command
      def initialize(text:)
        @text = text
      end

      def call
        success(payload: ConversionResult.new(
          raw_text: text,
          source_path: nil,
          source_type: "text",
          selection_kind: "full",
          selection_payload: {input_type: "raw_text"},
          note_filename: NoteFilename.new.call
        ))
      end

      private

      attr_reader :text
    end
  end
end
