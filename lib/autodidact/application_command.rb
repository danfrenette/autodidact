# frozen_string_literal: true

module Autodidact
  Result = Data.define(:payload, :error)

  class ApplicationCommand
    def self.call(params:, notify:)
      command = new
      command.call(params: params, notify: notify)
    rescue => e
      command.failure(e)
    end

    def success(payload:)
      Result.new(payload: payload, error: nil)
    end

    def failure(error)
      Result.new(payload: nil, error: {message: error.message})
    end
  end
end
