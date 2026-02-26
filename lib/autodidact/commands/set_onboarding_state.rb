# frozen_string_literal: true

module Autodidact
  module Commands
    class SetOnboardingState < Command
      def call(params:, notify:)
        state = params.fetch(:state)
        raise ArgumentError, "state must be an object" unless state.is_a?(Hash)

        Config::Store.write_onboarding(state)
        success(payload: {ok: true})
      end
    end
  end
end
