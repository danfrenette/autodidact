# frozen_string_literal: true

module Analysis
  class ClientForRole < ApplicationService
    Result = ApplicationResult.define(:client, :error_message)

    def initialize(user:, role:)
      @user = user
      @role = role
    end

    def call
      result = ProviderRoleSettings::Resolve.call(user: user, role: role)
      return failure(client: nil, error_message: result.error_message) if result.failure?

      success(client: client_for(result.role_setting), error_message: nil)
    rescue => e
      failure(client: nil, error_message: e.message)
    end

    private

    attr_reader :user, :role

    def client_for(role_setting)
      case role_setting.provider
      when "mock"
        mock_client_for(role_setting)
      when "openai"
        openai_client_for(role_setting)
      else
        raise "Unknown analysis provider for #{role_setting.role}: #{role_setting.provider.inspect}"
      end
    end

    def mock_client_for(role_setting)
      if role_setting.embedding?
        Analysis::MockEmbeddingClient.new
      elsif role_setting.generation?
        Analysis::MockGenerationClient.new
      else
        raise "Unknown analysis role: #{role_setting.role.inspect}"
      end
    end

    def openai_client_for(role_setting)
      if role_setting.embedding?
        Analysis::OpenaiEmbeddingClient.new(api_key: role_setting.provider_credential.api_key, model: role_setting.model)
      elsif role_setting.generation?
        Analysis::OpenaiGenerationClient.new(api_key: role_setting.provider_credential.api_key, model: role_setting.model)
      else
        raise "Unknown analysis role: #{role_setting.role.inspect}"
      end
    end
  end
end
