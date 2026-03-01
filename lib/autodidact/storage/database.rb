# frozen_string_literal: true

require "sequel"
require "sequel/extensions/migration"

module Autodidact
  module Storage
    class Database
      def call
        ensure_database_exists
        db = Sequel.connect(Autodidact.config.database_url)
        db.extension(:pg_enum)
        db.extension(:pg_json)
        db.extension(:pgvector)
        ::Sequel::Model.db = db
        run_migrations(db)
        db
      end

      private

      def ensure_database_exists
        uri = URI.parse(Autodidact.config.database_url)
        db_name = uri.path.delete_prefix("/")
        uri.path = "/postgres"

        Sequel.connect(uri.to_s) do |admin|
          admin.execute("CREATE DATABASE #{admin.literal(db_name.to_sym)}")
        end
      rescue Sequel::DatabaseError => e
        raise unless e.message.include?("already exists")
      end

      def run_migrations(db)
        Sequel::Migrator.run(db, migrations_path)
      end

      def migrations_path
        Autodidact.root.join("db", "migrate")
      end
    end
  end
end
