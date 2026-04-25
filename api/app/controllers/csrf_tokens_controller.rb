# frozen_string_literal: true

class CsrfTokensController < ApplicationController
  skip_before_action :authenticate_user!, only: :show

  def show
    render_success(
      template: "csrf_tokens/show",
      locals: {csrf_token: form_authenticity_token}
    )
  end
end
