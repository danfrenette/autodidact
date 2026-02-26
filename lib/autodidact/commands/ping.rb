# frozen_string_literal: true

module Autodidact
  module Commands
    class Ping < Command
      def call(params:, notify:)
        success(payload: { status: 'ok', version: Autodidact::VERSION })
      end
    end
  end
end
