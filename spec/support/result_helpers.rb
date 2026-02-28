# frozen_string_literal: true

module ResultHelpers
  def success_result(payload = nil)
    Autodidact::Result.new(payload: payload, error: nil)
  end

  def error_result(message = "error")
    Autodidact::Result.new(payload: nil, error: {message: message})
  end
end
