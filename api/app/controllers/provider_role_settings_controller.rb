# frozen_string_literal: true

class ProviderRoleSettingsController < ApplicationController
  def index
    ProviderCredentials::EnsureMockDefaults.call(user: current_user)

    render_success(
      template: "provider_role_settings/index",
      locals: {role_settings: current_user.provider_role_settings.includes(:provider_credential).order(:role)}
    )
  end

  def create
    result = ProviderRoleSettings::Upsert.call(
      user: current_user,
      role: role_setting_params.fetch(:role).to_sym,
      provider: role_setting_params.fetch(:provider),
      model: role_setting_params.fetch(:model)
    )

    if result.success?
      render_success(
        template: "provider_role_settings/create",
        locals: {role_setting: result.role_setting},
        status: :created
      )
    else
      render_error(
        code: "provider_role_setting_invalid",
        message: result.error_message,
        status: :unprocessable_content
      )
    end
  end

  def destroy
    current_user.provider_role_settings.find_by!(role: params[:id]).destroy!

    render_success(
      template: "provider_role_settings/destroy",
      locals: {role: params[:id]}
    )
  end

  private

  def role_setting_params
    params.require(:provider_role_setting).permit(:role, :provider, :model)
  end
end
