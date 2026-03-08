# frozen_string_literal: true

module Autodidact
  module Routes
    class SetOnboardingState < Route
      def call
        Commands::SetOnboardingState.call(state: params.fetch(:state))
      end
    end
  end
end
