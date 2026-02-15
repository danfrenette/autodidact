# frozen_string_literal: true

require "sequel"

module Autodidact
  module Storage
    class Database
      def call
        Sequel.connect(Autodidact.config.database_url).tap do |db|
          db.extension(:pg_enum)
        end
      end
    end
  end
end
