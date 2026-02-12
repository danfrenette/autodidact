# frozen_string_literal: true

require "json"

module Autodidact
  module Transport
    class Writer
      def initialize(output:)
        @output = output
        @mutex = Mutex.new
      end

      def result(id:, data:)
        write(id: id, result: data)
      end

      def error(id:, message:)
        write(id: id, error: {message: message})
      end

      def notify(method_name:, data:)
        write(method: method_name, params: data)
      end

      private

      def write(payload)
        @mutex.synchronize do
          @output.puts(payload.to_json)
          @output.flush
        end
      end
    end
  end
end
