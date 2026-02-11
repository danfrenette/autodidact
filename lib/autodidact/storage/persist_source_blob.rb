# frozen_string_literal: true

module Autodidact
  module Storage
    class PersistSourceBlob
      def call(source_path:, source_type:, selection_kind:, raw_text:, selection_payload: {})
        Models::SourceBlob.create(
          source_path: source_path,
          source_type: source_type,
          selection_kind: selection_kind,
          selection_payload: Sequel.pg_jsonb(selection_payload),
          raw_text: raw_text
        )
      end
    end
  end
end
