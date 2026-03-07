# frozen_string_literal: true

Sequel.migration do
  up do
    create_table(:source_blob_chunks) do
      column :id, :uuid, default: Sequel.lit("gen_random_uuid()"), primary_key: true
      foreign_key :source_blob_id, :source_blobs, type: :uuid, null: false
      foreign_key :source_chunk_id, :source_chunks, type: :uuid, null: false
      column :chunk_index, Integer, null: false

      index :source_chunk_id
      index [:source_blob_id, :source_chunk_id], unique: true
    end

    run <<~SQL
      INSERT INTO source_blob_chunks (source_blob_id, source_chunk_id, chunk_index)
      SELECT source_blob_id, id, chunk_index
      FROM source_chunks
    SQL

    alter_table(:source_chunks) do
      drop_index :chunk_id
      add_index :chunk_id, unique: true

      drop_column :source_blob_id
      drop_column :chunk_index
    end
  end

  down do
    alter_table(:source_chunks) do
      add_foreign_key :source_blob_id, :source_blobs, type: :uuid
      add_column :chunk_index, Integer
    end

    run <<~SQL
      UPDATE source_chunks sc
      SET source_blob_id = sub.source_blob_id,
          chunk_index = sub.chunk_index
      FROM (
        SELECT DISTINCT ON (source_chunk_id)
          source_chunk_id, source_blob_id, chunk_index
        FROM source_blob_chunks
        ORDER BY source_chunk_id, source_blob_id
      ) sub
      WHERE sub.source_chunk_id = sc.id
    SQL

    alter_table(:source_chunks) do
      set_column_not_null :source_blob_id
      set_column_not_null :chunk_index
      add_index :source_blob_id

      drop_index :chunk_id, unique: true
      add_index :chunk_id
    end

    drop_table(:source_blob_chunks)
  end
end
