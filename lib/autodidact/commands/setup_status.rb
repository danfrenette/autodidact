# frozen_string_literal: true

module Autodidact
  module Commands
    class SetupStatus < ApplicationCommand
      def call(params:, notify:)
        status = Config::Validator.call(config: Autodidact.config)

        success(payload: {
          status: status.ready? ? "ready" : "needs_setup",
          missing_fields: status.missing_fields,
          prefill: Autodidact.config.to_h
        })
      end
    end
  end
end
