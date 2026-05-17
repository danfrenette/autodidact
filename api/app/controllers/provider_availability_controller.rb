# frozen_string_literal: true

class ProviderAvailabilityController < ApplicationController
  def show
    result = ProviderRoleSettings::Availability.call(user: current_user)

    render_success(
      template: "provider_availability/show",
      locals: {availability: result}
    )
  end
end
