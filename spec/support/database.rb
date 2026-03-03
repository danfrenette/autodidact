# frozen_string_literal: true

require "sequel"
require "sequel/extensions/migration"

TEST_DATABASE_URL = "postgres://localhost:5432/autodidact_test"

DB_TEST = Sequel.connect(TEST_DATABASE_URL).tap do |db|
  db.extension(:pg_enum)
  db.extension(:pg_json)
  db.extension(:pgvector)
  Sequel::Migrator.run(db, Autodidact.root.join("db", "migrate"))
end

RSpec.configure do |config|
  config.around(:example, :db) do |example|
    original = Autodidact::DB.instance_variable_get(:@connection)
    Autodidact::DB.instance_variable_set(:@connection, DB_TEST)
    ::Sequel::Model.db = DB_TEST

    DB_TEST.transaction(rollback: :always, auto_savepoint: true) do
      example.run
    end
  ensure
    Autodidact::DB.instance_variable_set(:@connection, original)
    ::Sequel::Model.db = original
  end
end
