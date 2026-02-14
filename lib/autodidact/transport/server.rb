# frozen_string_literal: true

module Autodidact
  module Transport
    class Server
      def initialize(input:, output:, router:)
        @input = input
        @writer = Writer.new(output: output)
        @router = router
      end

      def call
        @input.each_line do |line|
          handle_line(line.strip)
        end
      end

      private

      def handle_line(line)
        return if line.empty?

        message = Message.from_json(line)
        notifier = build_notifier(message.id)

        result = @router.resolve(message.method_name).call(
          params: message.params,
          notify: notifier
        )

        @writer.result(id: message.id, data: result.to_h)
      end

      def build_notifier(request_id)
        proc do |**data|
          @writer.notify(
            method_name: "progress",
            data: data.merge(request_id: request_id)
          )
        end
      end
    end
  end
end
