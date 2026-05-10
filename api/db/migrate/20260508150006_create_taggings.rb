# frozen_string_literal: true

class CreateTaggings < ActiveRecord::Migration[8.1]
  def change
    create_table :taggings, id: :uuid do |t|
      t.uuid :tag_id, null: false
      t.uuid :taggable_id, null: false
      t.string :taggable_type, null: false

      t.timestamps
    end

    add_index :taggings, [:tag_id, :taggable_id, :taggable_type], unique: true
    add_index :taggings, [:taggable_id, :taggable_type]
    add_index :taggings, :tag_id

    add_foreign_key :taggings, :tags
  end
end
