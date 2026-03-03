# frozen_string_literal: true

module Autodidact
  class DB
    class << self
      def connection
        @connection ||= Storage::Database.new.call
      end

      def reset!
        @connection&.disconnect
        @connection = nil
      end
    end
  end
end
