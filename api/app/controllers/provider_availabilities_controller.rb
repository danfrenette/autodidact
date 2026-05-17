# frozen_string_literal: true

class ProviderAvailabilitiesController < ApplicationController
  def show
    result = ProviderRoleSettings::Availability.call(user: current_user)

    render_success(
      template: "provider_availabilities/show",
      locals: {availability: result}
    )
  end
end
