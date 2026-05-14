# frozen_string_literal: true

class CreateQuotes < ActiveRecord::Migration[8.1]
  def change
    create_table :quotes, id: :uuid do |t|
      t.references :source_selection, null: false, foreign_key: true, index: true, type: :uuid
      t.text :text, null: false
      t.text :note
      t.integer :position, null: false

      t.timestamps
    end

    add_index :quotes, [:source_selection_id, :position], unique: true
  end
end
