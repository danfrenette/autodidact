# frozen_string_literal: true

class CreateQuestions < ActiveRecord::Migration[8.1]
  def change
    create_table :questions, id: :uuid do |t|
      t.references :source_selection, null: false, foreign_key: true, index: true, type: :uuid
      t.integer :tier, null: false
      t.string :tier_name, null: false
      t.text :text, null: false
      t.text :answer, null: false
      t.integer :position, null: false

      t.timestamps
    end

    add_index :questions, [:source_selection_id, :position], unique: true
    add_index :questions, [:source_selection_id, :tier]
  end
end
