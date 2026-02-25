# frozen_string_literal: true

module Autodidact
  module Provider
    class ClientFor
      class UnknownProviderError < StandardError; end

      REGISTRY = {
        "openai" => OpenaiClient,
        "dev" => DevClient
      }.freeze

      def self.call(config:)
        new(config: config).call
      end

      def initialize(config:)
        @config = config
      end

      def call
        client_class.new(
          access_token: config.access_token,
          model: config.model
        )
      end

      private

      attr_reader :config

      def client_class
        REGISTRY.fetch(config.provider) do
          raise UnknownProviderError, "Unknown provider: #{config.provider.inspect}"
        end
      end
    end
  end
end
