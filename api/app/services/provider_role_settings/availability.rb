# frozen_string_literal: true

module ProviderRoleSettings
  class Availability < ApplicationService
    Result = ApplicationResult.define(:available, :missing_roles, :role_settings)

    def initialize(user:)
      @user = user
    end

    def call
      ProviderCredentials::EnsureMockDefaults.call(user: user) if Analysis::ProviderRegistry.mock_enabled?

      role_settings = user.provider_role_settings.includes(:provider_credential)
      missing_roles = []
      missing_roles << :embedding unless role_settings.find(&:embedding?)&.provider_credential&.connected?
      missing_roles << :generation unless role_settings.find(&:generation?)&.provider_credential&.connected?

      success(available: missing_roles.empty?, missing_roles: missing_roles, role_settings: role_settings)
    end

    private

    attr_reader :user
  end
end
