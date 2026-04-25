# frozen_string_literal: true

class DirectUploadsController < ActiveStorage::DirectUploadsController
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection

  protect_from_forgery with: :exception

  before_action :authenticate_user!

  private

  def current_user
    @current_user ||= Auth::CurrentUserResolver.new(cookies: cookies).call
  end

  def authenticate_user!
    return if current_user.present?

    render json: {error: "Unauthorized"}, status: :unauthorized
  end
end
