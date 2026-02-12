# frozen_string_literal: true

module Autodidact
  module Transport
    class Router
      def initialize
        @routes = {}
      end

      def register(method_name, command)
        @routes[method_name] = command
        self
      end

      def resolve(method_name)
        @routes.fetch(method_name) do
          raise ArgumentError, "Unknown method: #{method_name}"
        end
      end
    end
  end
end
