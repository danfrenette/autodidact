# frozen_string_literal: true

module ApiEnvelope
  extend ActiveSupport::Concern

  private

  def render_error(code:, message:, status:, details: nil)
    render(
      json: {
        data: nil,
        error: {
          code: code,
          message: message,
          details: details
        },
        meta: {}
      },
      status: status
    )
  end

  def render_success(template:, locals: {}, status: :ok)
    render(template: template, locals: locals, status: status, formats: [:json])
  end
end
