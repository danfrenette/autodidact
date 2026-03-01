# frozen_string_literal: true

module Autodidact
  module Storage
    class PersistSourceBlob
      def self.call(source_path:, source_type:, selection_kind:, raw_text:, selection_payload: {}, tags: [])
        new(
          source_path: source_path,
          source_type: source_type,
          selection_kind: selection_kind,
          raw_text: raw_text,
          selection_payload: selection_payload,
          tags: tags
        ).call
      end

      def initialize(source_path:, source_type:, selection_kind:, raw_text:, selection_payload: {}, tags: [])
        @source_path = source_path
        @source_type = source_type
        @selection_kind = selection_kind
        @raw_text = raw_text
        @selection_payload = selection_payload
        @tags = tags
      end

      def call
        blob = Models::SourceBlob.create(
          source_path: source_path,
          source_type: source_type,
          selection_kind: selection_kind,
          selection_payload: Sequel.pg_jsonb(selection_payload),
          raw_text: raw_text
        )

        associate_tags(blob) if tags.any?

        blob
      end

      private

      attr_reader :source_path, :source_type, :selection_kind, :raw_text, :selection_payload, :tags

      def associate_tags(blob)
        tags.each do |tag_name|
          normalized = tag_name.to_s.strip.downcase
          next if normalized.empty?

          tag = Models::Tag.find_or_create(name: normalized)
          blob.add_tag(tag)
        end
      end
    end
  end
end
