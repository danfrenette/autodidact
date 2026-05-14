# frozen_string_literal: true

class CreateCitations < ActiveRecord::Migration[8.1]
  def change
    create_table :citations, id: :uuid do |t|
      t.references :citable, null: false, polymorphic: true, type: :uuid
      t.references :source_chunk, null: false, foreign_key: true, type: :uuid
      t.string :role, null: false, default: "supporting"
      t.integer :position, null: false

      t.timestamps
    end

    add_index :citations, [:citable_type, :citable_id, :position], unique: true
  end
end
