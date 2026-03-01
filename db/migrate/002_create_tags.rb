# frozen_string_literal: true

Sequel.migration do
  change do
    create_table(:tags) do
      column :id, :uuid, default: Sequel.lit("gen_random_uuid()"), primary_key: true
      column :name, String, null: false, unique: true
      column :created_at, DateTime, default: Sequel::CURRENT_TIMESTAMP
    end
  end
end
