# frozen_string_literal: true

module ProviderRoleSettings
  class Resolve < ApplicationService
    Result = ApplicationResult.define(:role_setting, :error_message)

    def initialize(user:, role:)
      @user = user
      @role = role
    end

    def call
      ProviderCredentials::EnsureMockDefaults.call(user: user) if Analysis::ProviderRegistry.mock_enabled?

      role_setting = user.provider_role_settings.includes(:provider_credential).find_by(role: role)
      return failure(role_setting: nil, error_message: "#{role.capitalize} provider not configured") if role_setting.blank?
      unless role_setting.provider_credential.connected?
        return failure(role_setting: nil, error_message: credential_error_message(role_setting.provider_credential))
      end

      success(role_setting: role_setting, error_message: nil)
    end

    private

    attr_reader :user, :role

    def credential_error_message(credential)
      return credential.last_error_message if credential.error? && credential.last_error_message.present?

      "#{credential.provider} credential is not connected"
    end
  end
end
