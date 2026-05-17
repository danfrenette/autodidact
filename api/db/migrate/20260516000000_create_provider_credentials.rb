class CreateProviderCredentials < ActiveRecord::Migration[8.1]
  def change
    create_table :provider_credentials, id: :uuid do |t|
      t.string :user_id, null: false
      t.string :provider, null: false
      t.string :credential_kind, null: false, default: "user_key"
      t.text :api_key
      t.string :key_fingerprint
      t.string :status, null: false, default: "disconnected"
      t.datetime :last_verified_at
      t.text :last_error_message

      t.timestamps
    end

    add_index :provider_credentials, [:user_id, :provider], unique: true
    add_index :provider_credentials, :status
  end
end
