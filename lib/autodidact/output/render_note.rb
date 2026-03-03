# frozen_string_literal: true

require "erb"

module Autodidact
  module Output
    class RenderNote
      def self.call(tags:, source_path:, content:, created_at:)
        new(tags: tags, source_path: source_path, content: content, created_at: created_at).call
      end

      def initialize(tags:, source_path:, content:, created_at:)
        @tags = normalize_tags(tags)
        @source_path = source_path
        @content = content
        @created_at = created_at
      end

      def call
        ERB.new(template, trim_mode: "-").result(binding)
      end

      private

      attr_reader :tags, :source_path, :content, :created_at

      def template
        File.read(Autodidact.root.join("templates", "learning_note.md.erb"))
      end

      def normalize_tags(raw_tags)
        Array(raw_tags)
          .map { |tag| tag.to_s.strip.downcase.sub(/^#+/, "") }
          .reject(&:empty?)
          .uniq
      end
    end
  end
end
