# frozen_string_literal: true

module Autodidact
  module Convert
    class PdfConverter < Command
      def initialize(path:, source_type:, chapter: nil)
        @path = path
        @source_type = source_type
        @chapter = chapter
      end

      def call
        if chapter
          convert_chapter
        elsif chapters.any?
          success(payload: Commands::Payloads::PendingSelection.new(chapters: chapters))
        else
          convert_full
        end
      end

      private

      attr_reader :path, :source_type, :chapter

      def document
        @document ||= PdfDocument.new(path)
      end

      def chapters
        @chapters ||= document.chapters
      end

      def convert_chapter
        start_page = chapter[:page]
        next_chapter = chapters.find { |c| c[:page] > start_page }
        end_page = next_chapter ? next_chapter[:page] - 1 : document.page_count

        success(payload: ConversionResult.new(
          raw_text: document.pages_text(start_page..end_page),
          source_path: path,
          source_type: source_type,
          selection_kind: "chapter",
          selection_payload: {title: chapter[:title], start_page: start_page, end_page: end_page},
          note_filename: chapter_filename
        ))
      end

      def convert_full
        success(payload: ConversionResult.new(
          raw_text: document.pages_text(1..document.page_count),
          source_path: path,
          source_type: source_type,
          selection_kind: "full",
          selection_payload: {},
          note_filename: full_filename
        ))
      end

      def chapter_filename
        NoteFilename.new(path: path, chapter: chapter).call
      end

      def full_filename
        NoteFilename.new(path: path).call
      end
    end
  end
end
