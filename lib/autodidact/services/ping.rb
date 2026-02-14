# frozen_string_literal: true

module Autodidact
  module Services
    class Ping < ApplicationService
      def call(params:, notify:)
        success(payload: {status: "ok", version: Autodidact::VERSION})
      end
    end
  end
end
