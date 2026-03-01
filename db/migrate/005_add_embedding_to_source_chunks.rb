# frozen_string_literal: true

Sequel.migration do
  up do
    run "CREATE EXTENSION IF NOT EXISTS vector"
    alter_table(:source_chunks) do
      # 1536 = output dimensions of text-embedding-3-small (fixed, not configurable)
      add_column :embedding, :vector, size: 1536
    end
    run "CREATE INDEX ON source_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
  end

  down do
    alter_table(:source_chunks) do
      drop_column :embedding
    end
  end
end
