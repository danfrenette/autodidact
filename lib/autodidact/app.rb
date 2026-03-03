# frozen_string_literal: true

module Autodidact
  class App
    def call
      initialize_router
      register_commands
      boot_database
      start_server
    end

    private

    attr_reader :router

    def initialize_router
      @router = Transport::Router.new
    end

    def register_commands
      router.register("ping", Commands::Ping)
      router.register("setup_status", Commands::SetupStatus)
      router.register("update_config", Commands::UpdateConfig)
      router.register("get_onboarding_state", Commands::GetOnboardingState)
      router.register("set_onboarding_state", Commands::SetOnboardingState)
      router.register("detect_source", Commands::DetectSource)
      router.register("analyze_source", Commands::AnalyzeSource)
    end

    def boot_database
      DB.connection
    end

    def start_server
      Transport::Server.new(
        input: $stdin,
        output: $stdout,
        router: router
      ).call
    end
  end
end
