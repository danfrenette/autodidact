# frozen_string_literal: true

module Autodidact
  module Provider
    class ClientFor
      class UnknownProviderError < ProviderError; end

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
        raise UnknownProviderError, "Unknown provider: #{config.provider.inspect}" unless definition_supported?

        definition.runtime_client_class
      end

      def definition
        @definition ||= Config::Providers::Catalog.fetch(config.provider)
      end

      def definition_supported?
        !definition.nil? && !definition.runtime_client_class.nil?
      end
    end
  end
end
