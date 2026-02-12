# frozen_string_literal: true

module Autodidact
  module Commands
    class Ping
      def call(params:, notify:)
        {status: "ok", version: Autodidact::VERSION}
      end
    end
  end
end
