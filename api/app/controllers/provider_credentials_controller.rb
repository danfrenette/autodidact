# frozen_string_literal: true

class ProviderCredentialsController < ApplicationController
  def index
    render_success(
      template: "provider_credentials/index",
      locals: {credentials: current_user.provider_credentials.order(:provider)}
    )
  end

  def create
    result = ProviderCredentials::Upsert.call(
      user: current_user,
      provider: credential_params.fetch(:provider),
      api_key: credential_params.fetch(:api_key)
    )

    if result.success?
      render_success(
        template: "provider_credentials/create",
        locals: {credential: result.credential},
        status: :created
      )
    else
      render_error(
        code: "provider_credential_invalid",
        message: result.error_message,
        status: :unprocessable_content
      )
    end
  end

  def update
    result = ProviderCredentials::Upsert.call(
      user: current_user,
      provider: credential.provider,
      api_key: credential_params.fetch(:api_key)
    )

    if result.success?
      render_success(
        template: "provider_credentials/update",
        locals: {credential: result.credential}
      )
    else
      render_error(
        code: "provider_credential_invalid",
        message: result.error_message,
        status: :unprocessable_content
      )
    end
  end

  def destroy
    credential.update!(status: :disconnected)

    render_success(
      template: "provider_credentials/destroy",
      locals: {credential: credential}
    )
  end

  private

  def credential
    @credential ||= current_user.provider_credentials.find(params[:id])
  end

  def credential_params
    params.require(:provider_credential).permit(:provider, :api_key)
  end
end
