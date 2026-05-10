# frozen_string_literal: true

class CreateTags < ActiveRecord::Migration[8.1]
  def change
    create_table :tags, id: :uuid do |t|
      t.string :user_id, null: false
      t.string :name, null: false

      t.timestamps
    end

    add_index :tags, [:user_id, :name], unique: true
    add_index :tags, :name
  end
end
