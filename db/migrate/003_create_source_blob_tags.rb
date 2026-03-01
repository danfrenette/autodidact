# frozen_string_literal: true

Sequel.migration do
  change do
    create_table(:source_blob_tags) do
      column :id, :uuid, default: Sequel.lit("gen_random_uuid()"), primary_key: true
      foreign_key :source_blob_id, :source_blobs, type: :uuid, null: false
      foreign_key :tag_id, :tags, type: :uuid, null: false
      column :created_at, DateTime, default: Sequel::CURRENT_TIMESTAMP

      unique %i[source_blob_id tag_id]
    end
  end
end
