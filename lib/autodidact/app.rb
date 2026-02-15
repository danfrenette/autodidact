# frozen_string_literal: true

module Autodidact
  class App
    def call
      boot_database
      start_server
    end

    private

    attr_reader :router

    def boot_database
      Storage::Database.new.call
    end

    def start_server
      initialize_router
      register_services

      Transport::Server.new(
        input: $stdin,
        output: $stdout,
        router: router
      ).call
    end

    def initialize_router
      @router ||= Transport::Router.new
    end

    def register_services
      router.register("ping", Services::Ping)
      router.register("detect_source", Services::DetectSource)
      router.register("analyze_source", Services::AnalyzeSource)
    end
  end
end
