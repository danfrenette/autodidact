# frozen_string_literal: true

Sequel.migration do
  change do
    create_enum(:source_type, %w[text pdf])
    create_enum(:selection_kind, %w[chapter page_range line_range full])

    create_table(:source_blobs) do
      column :id, :uuid, default: Sequel.lit("gen_random_uuid()"), primary_key: true
      column :source_path, String, null: false
      column :source_type, :source_type, null: false
      column :selection_kind, :selection_kind, null: false
      column :selection_payload, :jsonb, default: Sequel.lit("'{}'::jsonb")
      column :raw_text, :text, null: false
      column :created_at, DateTime, default: Sequel::CURRENT_TIMESTAMP
    end
  end
end
