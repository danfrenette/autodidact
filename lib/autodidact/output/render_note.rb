# frozen_string_literal: true

require "erb"

module Autodidact
  module Output
    class RenderNote
      def self.call(tag:, source_path:, content:, created_at:)
        new(tag: tag, source_path: source_path, content: content, created_at: created_at).call
      end

      def initialize(tag:, source_path:, content:, created_at:)
        @tag = tag
        @source_path = source_path
        @content = content
        @created_at = created_at
      end

      def call
        ERB.new(template, trim_mode: "-").result(binding)
      end

      private

      attr_reader :tag, :source_path, :content, :created_at

      def template
        File.read(Autodidact.root.join("templates", "learning_note.md.erb"))
      end
    end
  end
end
