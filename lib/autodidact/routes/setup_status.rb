# frozen_string_literal: true

module Autodidact
  module Routes
    class SetupStatus < Route
      def call
        Commands::SetupStatus.call
      end
    end
  end
end
