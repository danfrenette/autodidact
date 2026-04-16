class CreateAuthSchema < ActiveRecord::Migration[8.1]
  def up
    execute "CREATE SCHEMA IF NOT EXISTS auth"
  end

  def down
    execute "DROP SCHEMA IF EXISTS auth CASCADE"
  end
end
