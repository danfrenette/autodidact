# frozen_string_literal: true

module Autodidact
  module Routes
    class GetOnboardingState < Route
      def call
        Commands::GetOnboardingState.call
      end
    end
  end
end
