# frozen_string_literal: true

require "faraday"

module Autodidact
  module Config
    class HttpConnection
      def self.call(url:, open_timeout:, timeout:)
        new(url: url, open_timeout: open_timeout, timeout: timeout).call
      end

      def initialize(url:, open_timeout:, timeout:)
        @url = url
        @open_timeout = open_timeout
        @timeout = timeout
      end

      def call
        Faraday.new(url: url) do |conn|
          conn.options.open_timeout = open_timeout
          conn.options.timeout = timeout
        end
      end

      private

      attr_reader :url, :open_timeout, :timeout
    end
  end
end
