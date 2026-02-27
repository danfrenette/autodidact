# frozen_string_literal: true

module Autodidact
  module Commands
    class GetOnboardingState < Query
      def call
        success(payload: {state: Config::Store.read_onboarding})
      end
    end
  end
end
