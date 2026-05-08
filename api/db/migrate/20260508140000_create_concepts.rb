# frozen_string_literal: true

class CreateConcepts < ActiveRecord::Migration[8.1]
  def change
    create_table :concepts do |t|
      t.references :source_selection, null: false, foreign_key: true, index: true
      t.string :name, null: false
      t.string :classification, null: false, default: "supporting"
      t.text :definition
      t.text :why_it_matters
      t.timestamps
    end

    add_index :concepts, :classification
    add_index :concepts, [:source_selection_id, :name], unique: true
  end
end
