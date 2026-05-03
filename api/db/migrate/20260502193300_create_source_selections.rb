# frozen_string_literal: true

class CreateSourceSelections < ActiveRecord::Migration[8.1]
  def change
    create_table :source_selections do |t|
      t.references :source, null: false, foreign_key: true
      t.string :kind, null: false, default: "chapter"
      t.string :subtype
      t.string :status, null: false, default: "pending"
      t.string :title, null: false
      t.string :label, null: false
      t.jsonb :position, null: false, default: {}
      t.jsonb :locator, null: false, default: {}
      t.text :error_message

      t.timestamps
    end

    add_index :source_selections, :kind
    add_index :source_selections, :status
    add_index :source_selections, :position, using: :gin
    add_index :source_selections, :locator, using: :gin
  end
end
