# frozen_string_literal: true

module ProviderCredentials
  class EnsureMockDefaults < ApplicationService
    Result = ApplicationResult.define(:credential)

    def initialize(user:)
      @user = user
    end

    def call
      return success(credential: nil) unless Analysis::ProviderRegistry.mock_enabled?

      credential = ensure_mock_credential
      ensure_mock_role_settings(credential)

      success(credential: credential)
    end

    private

    attr_reader :user

    def ensure_mock_credential
      user.provider_credentials.find_or_create_by!(provider: "mock") do |record|
        record.credential_kind = :system
        record.status = :connected
        record.last_verified_at = Time.current
      end
    end

    def ensure_mock_role_settings(credential)
      %i[embedding generation].each do |role|
        user.provider_role_settings.find_or_create_by!(role: role) do |setting|
          setting.provider_credential = credential
          setting.model = mock_provider.default_model_for(role)
        end
      end
    end

    def mock_provider
      @mock_provider ||= Analysis::ProviderRegistry.fetch("mock")
    end
  end
end
