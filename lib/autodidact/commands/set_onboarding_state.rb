# frozen_string_literal: true

module Autodidact
  module Commands
    class SetOnboardingState < Command
      def initialize(params:, **)
        @state = params.fetch(:state)
      end

      def call
        Config::Store.write_onboarding(state)
        success(payload: {ok: true})
      end

      private

      attr_reader :state
    end
  end
end
