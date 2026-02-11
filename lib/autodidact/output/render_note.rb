# frozen_string_literal: true

require "erb"

module Autodidact
  module Output
    class RenderNote
      def call(tag:, source_path:, content:, created_at: Time.now)
        ERB.new(template, trim_mode: "-").result(binding)
      end

      private

      def template
        File.read(Autodidact.root.join("templates", "learning_note.md.erb"))
      end
    end
  end
end
