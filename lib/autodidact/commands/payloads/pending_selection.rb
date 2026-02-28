# frozen_string_literal: true

module Autodidact
  module Commands
    module Payloads
      class PendingSelection
        def initialize(chapters:)
          @chapters = chapters
        end

        def continue?
          false
        end

        def to_wire
          {status: "pending_selection", chapters: chapters}
        end

        private

        attr_reader :chapters
      end
    end
  end
end
