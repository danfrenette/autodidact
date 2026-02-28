# frozen_string_literal: true

module Autodidact
  module Convert
    # Generates a slug-based note filename from a source path and optional chapter.
    class NoteFilename
      def initialize(path: nil, chapter: nil)
        @path = path
        @chapter = chapter
      end

      def call
        parts = [timestamp, basename, chapter_slug].compact
        "#{parts.join("--")}.md"
      end

      private

      attr_reader :path, :chapter

      def timestamp
        Time.now.strftime("%Y-%m-%d")
      end

      def basename
        return "raw-text" unless path

        File.basename(path, ".*").gsub(/[^a-zA-Z0-9\-_]+/, "-")
      end

      def chapter_slug
        return unless chapter

        chapter[:title].downcase.gsub(/[^a-z0-9]+/, "-").gsub(/\A-|-\z/, "")
      end
    end
  end
end
