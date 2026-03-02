# frozen_string_literal: true

module Autodidact
  module Convert
    class UrlConverter < Command
      class FetchError < StandardError; end

      def initialize(url:)
        @url = url
      end

      def call
        pages = fetch_pages
        content = pages.first.content
        title = pages.first.title

        success(payload: ConversionResult.new(
          raw_text: content,
          source_path: url,
          source_type: "url",
          selection_kind: "full",
          selection_payload: {
            input_type: "url",
            title: title
          },
          note_filename: NoteFilename.new(path: title || url).call
        ))
      end

      private

      attr_reader :url

      def fetch_pages
        require "nous"

        pages = Nous.fetch(url)
        raise FetchError, "No content extracted from URL" if pages.empty?

        pages
      rescue LoadError
        raise FetchError, "nous gem is required for URL conversion. Please add it to your Gemfile."
      rescue => e
        raise FetchError, "Failed to fetch URL: #{e.message}"
      end
    end
  end
end
