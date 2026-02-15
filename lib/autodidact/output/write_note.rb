# frozen_string_literal: true

module Autodidact
  module Output
    class WriteNote
      def self.call(vault_path:, filename:, rendered_content:)
        new(vault_path: vault_path, filename: filename, rendered_content: rendered_content).call
      end

      def initialize(vault_path:, filename:, rendered_content:)
        @vault_path = Pathname.new(vault_path)
        @filename = filename
        @rendered_content = rendered_content
      end

      def call
        destination = vault_path.join(filename)
        File.write(destination, rendered_content)
        destination
      end

      private

      attr_reader :vault_path, :filename, :rendered_content
    end
  end
end
