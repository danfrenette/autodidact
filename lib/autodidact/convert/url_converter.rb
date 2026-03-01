# frozen_string_literal: true

module Autodidact
  module Convert
    class UrlConverter < Command
      class FetchError < StandardError; end

      def initialize(url:, recursive: false, limit: 20, timeout: 30, selector: nil, use_jina: false)
        @url = url
        @recursive = recursive
        @limit = limit
        @timeout = timeout
        @selector = selector
        @use_jina = use_jina
      end

      def call
        pages = fetch_pages
        content = format_content(pages)

        success(payload: ConversionResult.new(
          raw_text: content,
          source_path: url,
          source_type: "url",
          selection_kind: "full",
          selection_payload: {
            input_type: "url",
            title: pages.first&.title,
            page_count: pages.size,
            recursive: recursive
          },
          note_filename: NoteFilename.new.call
        ))
      end

      private

      attr_reader :url, :recursive, :limit, :timeout, :selector, :use_jina

      def fetch_pages
        require "nous"

        extractor = use_jina ? jina_extractor : default_extractor
        options = build_options

        pages = Nous.fetch(url, extractor:, **options)
        raise FetchError, "No content extracted from URL" if pages.empty?

        pages
      rescue LoadError
        raise FetchError, "nous gem is required for URL conversion. Please add it to your Gemfile."
      rescue => e
        raise FetchError, "Failed to fetch URL: #{e.message}"
      end

      def default_extractor
        selector ? Extractor::Default.new(selector:) : Extractor::Default.new
      end

      def jina_extractor
        Extractor::Jina.new
      end

      def build_options
        opts = {}
        opts[:limit] = limit if recursive
        opts[:timeout] = timeout
        opts
      end

      def format_content(pages)
        if pages.size == 1
          pages.first.content
        else
          pages.map { |page| "## #{page.title}\n\n#{page.content}" }.join("\n\n---\n\n")
        end
      end
    end
  end
end
