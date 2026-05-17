# frozen_string_literal: true

module ProviderRoleSettings
  class Upsert < ApplicationService
    Result = ApplicationResult.define(:role_setting, :error_message)

    def initialize(user:, role:, provider:, model:)
      @user = user
      @role = role
      @provider = provider.to_s
      @model = model.to_s
    end

    def call
      definition = Analysis::ProviderRegistry.fetch(provider)
      return failure(role_setting: nil, error_message: "Provider does not support #{role}") unless definition.supports?(role)
      return failure(role_setting: nil, error_message: "Model is not available for #{role}") unless definition.models_for(role).include?(model)

      credential = find_credential(definition)
      return failure(role_setting: nil, error_message: "#{definition.display_name} credential is not connected") unless credential&.connected?

      role_setting = save_role_setting(credential)

      success(role_setting: role_setting, error_message: nil)
    end

    private

    attr_reader :user, :role, :provider, :model

    def find_credential(definition)
      if definition.requires_credentials
        user.provider_credentials.find_by(provider: provider)
      else
        ProviderCredentials::EnsureMockDefaults.call(user: user).credential
      end
    end

    def save_role_setting(credential)
      user.provider_role_settings.find_or_initialize_by(role: role).tap do |role_setting|
        role_setting.update!(provider_credential: credential, model: model)
      end
    end
  end
end
