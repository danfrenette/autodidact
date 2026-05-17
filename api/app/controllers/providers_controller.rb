# frozen_string_literal: true

class ProvidersController < ApplicationController
  def index
    render_success(
      template: "providers/index",
      locals: {providers: Analysis::ProviderRegistry.all}
    )
  end
end
