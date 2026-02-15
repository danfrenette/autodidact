# frozen_string_literal: true

module Autodidact
  module Storage
    class PersistSourceBlob
      def self.call(source_path:, source_type:, selection_kind:, raw_text:, selection_payload: {})
        new(
          source_path: source_path,
          source_type: source_type,
          selection_kind: selection_kind,
          raw_text: raw_text,
          selection_payload: selection_payload
        ).call
      end

      def initialize(source_path:, source_type:, selection_kind:, raw_text:, selection_payload: {})
        @source_path = source_path
        @source_type = source_type
        @selection_kind = selection_kind
        @raw_text = raw_text
        @selection_payload = selection_payload
      end

      def call
        Models::SourceBlob.create(
          source_path: source_path,
          source_type: source_type,
          selection_kind: selection_kind,
          selection_payload: Sequel.pg_jsonb(selection_payload),
          raw_text: raw_text
        )
      end

      private

      attr_reader :source_path, :source_type, :selection_kind, :raw_text, :selection_payload
    end
  end
end
