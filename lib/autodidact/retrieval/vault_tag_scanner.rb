# frozen_string_literal: true

require "yaml"

module Autodidact
  module Retrieval
    class VaultTagScanner
      def initialize(vault_path:)
        @vault_path = vault_path
      end

      def call
        return Set.new unless scannable?

        markdown_files.each_with_object(Set.new) do |path, tags|
          frontmatter_tags(path).each { |tag| tags.add(tag) }
        end
      end

      private

      attr_reader :vault_path

      def scannable?
        vault_path && File.directory?(vault_path)
      end

      def markdown_files
        Dir.glob(File.join(vault_path, "**", "*.md"))
      end

      def frontmatter_tags(path)
        raw_tags = read_frontmatter(path)&.dig("tags")
        return [] unless raw_tags.is_a?(Array)

        raw_tags.filter_map { |value| normalize(value) }
      rescue SystemCallError
        []
      end

      def read_frontmatter(path)
        lines = []
        in_frontmatter = false

        File.open(path, encoding: "utf-8") do |f|
          f.each_line do |line|
            stripped = line.chomp

            if !in_frontmatter && stripped == "---"
              in_frontmatter = true
              next
            end

            break unless in_frontmatter
            break if stripped == "---"

            lines << line
          end
        end

        return if lines.empty?

        YAML.safe_load(lines.join)
      rescue Psych::SyntaxError
        nil
      end

      def normalize(value)
        result = value.to_s.strip.downcase.sub(/^#+/, "")
        result.empty? ? nil : result
      end
    end
  end
end
