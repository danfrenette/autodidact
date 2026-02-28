# frozen_string_literal: true

module Autodidact
  module Commands
    module Payloads
      class CompletedAnalysis
        def initialize(note_path:, source_blob_id:)
          @note_path = note_path
          @source_blob_id = source_blob_id
        end

        def continue?
          true
        end

        def to_wire
          {
            status: "completed",
            note_path: note_path,
            source_blob_id: source_blob_id
          }
        end

        private

        attr_reader :note_path, :source_blob_id
      end
    end
  end
end
