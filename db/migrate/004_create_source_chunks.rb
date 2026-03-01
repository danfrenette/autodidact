# frozen_string_literal: true

Sequel.migration do
  change do
    create_table(:source_chunks) do
      column :id, :uuid, default: Sequel.lit("gen_random_uuid()"), primary_key: true
      foreign_key :source_blob_id, :source_blobs, type: :uuid, null: false
      column :chunk_index, Integer, null: false
      column :content, :text, null: false
      column :created_at, DateTime, default: Sequel::CURRENT_TIMESTAMP

      index :source_blob_id
    end
  end
end
