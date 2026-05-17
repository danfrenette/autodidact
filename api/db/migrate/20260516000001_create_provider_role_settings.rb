class CreateProviderRoleSettings < ActiveRecord::Migration[8.1]
  def change
    create_table :provider_role_settings, id: :uuid do |t|
      t.string :user_id, null: false
      t.string :role, null: false
      t.references :provider_credential, null: false, type: :uuid, foreign_key: true
      t.string :model, null: false

      t.timestamps
    end

    add_index :provider_role_settings, [:user_id, :role], unique: true
  end
end
