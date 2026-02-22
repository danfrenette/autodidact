# frozen_string_literal: true

module Autodidact
  module Commands
    class GetOnboardingState < ApplicationCommand
      def call(params:, notify:)
        success(payload: {state: Config::Store.read_onboarding})
      end
    end
  end
end
