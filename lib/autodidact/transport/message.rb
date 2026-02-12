# frozen_string_literal: true

require "json"

module Autodidact
  module Transport
    class Message
      attr_reader :id, :method_name, :params

      def initialize(id:, method_name:, params: {})
        @id = id
        @method_name = method_name
        @params = params
      end

      def self.from_json(json_string)
        data = JSON.parse(json_string, symbolize_names: true)

        new(
          id: data[:id],
          method_name: data[:method],
          params: data.fetch(:params, {})
        )
      end
    end
  end
end
