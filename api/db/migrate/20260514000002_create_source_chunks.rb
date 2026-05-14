# frozen_string_literal: true

class CreateSourceChunks < ActiveRecord::Migration[8.1]
  def change
    enable_extension "vector"

    create_table :source_chunks, id: :uuid do |t|
      t.references :source_selection_content, null: false, foreign_key: true, index: true, type: :uuid
      t.integer :chunk_index, null: false
      t.text :content, null: false
      t.integer :token_count, null: false
      t.string :chunk_id, null: false
      t.integer :byte_offset, null: false
      t.integer :byte_length, null: false
      t.column :embedding, :vector, limit: 1536

      t.timestamps
    end

    add_index :source_chunks, [:source_selection_content_id, :chunk_index], unique: true
    add_index :source_chunks, :chunk_id
  end
end
