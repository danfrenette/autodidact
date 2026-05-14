# frozen_string_literal: true

class CreateSourceSelectionContents < ActiveRecord::Migration[8.1]
  def change
    create_table :source_selection_contents, id: :uuid do |t|
      t.references :source_selection, null: false, foreign_key: true, index: {unique: true}, type: :uuid
      t.text :raw_text, null: false
      t.jsonb :locator_spans, null: false, default: []

      t.timestamps
    end
  end
end
