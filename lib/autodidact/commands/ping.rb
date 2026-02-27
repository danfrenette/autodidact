# frozen_string_literal: true

module Autodidact
  module Commands
    class Ping < Query
      def call
        success(payload: {status: "ok", version: Autodidact::VERSION})
      end
    end
  end
end
