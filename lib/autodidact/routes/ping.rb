# frozen_string_literal: true

module Autodidact
  module Routes
    class Ping < Route
      def call
        Commands::Ping.call
      end
    end
  end
end
