# frozen_string_literal: true

Sequel.migration do
  up do
    alter_table(:source_chunks) do
      add_column :token_count, Integer, null: false
      add_column :chunk_id, String, null: false
      add_index :chunk_id
      set_column_not_null :embedding
      set_column_not_null :created_at
    end
  end

  down do
    alter_table(:source_chunks) do
      drop_column :token_count
      drop_column :chunk_id
      set_column_allow_null :embedding
      set_column_allow_null :created_at
    end
  end
end
