# frozen_string_literal: true

module Autodidact
  class App
    def call
      router = Transport::Router.new
      router.register("ping", Commands::Ping.new)
      router.register("detect_source", Commands::DetectSource.new)

      Transport::Server.new(
        input: $stdin,
        output: $stdout,
        router: router
      ).call
    end
  end
end
