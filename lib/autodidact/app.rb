# frozen_string_literal: true

module Autodidact
  class App
    def call
      router = Transport::Router.new
      router.register("ping", Services::Ping)
      router.register("detect_source", Services::DetectSource)

      Transport::Server.new(
        input: $stdin,
        output: $stdout,
        router: router
      ).call
    end
  end
end
