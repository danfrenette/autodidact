class CreateSources < ActiveRecord::Migration[8.1]
  def change
    create_table :sources do |t|
      t.string :user_id, null: false
      t.string :title, null: false
      t.string :author
      t.string :kind, null: false, default: "pdf"
      t.string :original_filename
      t.jsonb :structure, null: false, default: {}
      t.string :status, null: false, default: "draft"
      t.text :error_message
      t.jsonb :selected_structure_ids, null: false, default: []
      t.jsonb :analysis_summary, null: false, default: {}

      t.timestamps
    end

    add_index :sources, :user_id
    add_index :sources, :status
    add_index :sources, :kind
    add_index :sources, :structure, using: :gin
    add_index :sources, :selected_structure_ids, using: :gin
  end
end
