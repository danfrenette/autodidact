# frozen_string_literal: true

module Autodidact
  module Output
    class WriteNote
      def initialize(vault_path:)
        @vault_path = Pathname.new(vault_path)
      end

      def call(filename:, rendered_content:)
        destination = @vault_path.join(filename)

        File.write(destination, rendered_content)

        destination
      end
    end
  end
end
