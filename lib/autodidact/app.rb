# frozen_string_literal: true

module Autodidact
  class App
    def call
      initialize_router
      register_routes
      boot_database
      start_server
    end

    private

    attr_reader :router

    def initialize_router
      @router = Transport::Router.new
    end

    def register_routes
      router.register("ping", Routes::Ping)
      router.register("setup_status", Routes::SetupStatus)
      router.register("update_config", Routes::UpdateConfig)
      router.register("get_onboarding_state", Routes::GetOnboardingState)
      router.register("set_onboarding_state", Routes::SetOnboardingState)
      router.register("detect_source", Routes::DetectSource)
      router.register("analyze_source", Routes::AnalyzeSource)
      router.register("detect_input_type", Routes::DetectInputType)
      router.register("list_vault_tags", Routes::ListVaultTags)
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
