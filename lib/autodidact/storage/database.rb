# frozen_string_literal: true

require "sequel"

module Autodidact
  module Storage
    class Database
      def call
        Sequel.connect(connection_url).tap do |db|
          db.extension(:pg_enum)
        end
      end

      private

      def connection_url
        ENV.fetch("DATABASE_URL") do
          raise "DATABASE_URL is not set"
        end
      end
    end
  end
end
