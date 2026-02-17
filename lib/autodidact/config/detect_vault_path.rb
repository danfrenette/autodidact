# frozen_string_literal: true

module Autodidact
  module Config
    class DetectVaultPath
      SEARCH_DEPTH = 3

      COMMON_ROOTS = [
        File.join(Dir.home, "Documents"),
        File.join(Dir.home, "Obsidian"),
        File.join(Dir.home, "Library", "Mobile Documents", "iCloud~md~obsidian", "Documents")
      ].freeze

      def self.call
        new.call
      end

      def call
        search_directories.find { |path| vault_directory?(path) }
      end

      private

      def search_directories
        COMMON_ROOTS.select { |path| File.directory?(path) }
          .flat_map { |path| [path] + descendants(path: path, depth: SEARCH_DEPTH) }
      end

      def descendants(path:, depth:)
        children = Dir.children(path).map { |name| File.join(path, name) }
          .select { |child| File.directory?(child) }

        return children if depth <= 1

        children + children.flat_map { |child| descendants(path: child, depth: depth - 1) }
      rescue Errno::EACCES, Errno::ENOENT
        []
      end

      def vault_directory?(path)
        File.directory?(File.join(path, ".obsidian"))
      end
    end
  end
end
