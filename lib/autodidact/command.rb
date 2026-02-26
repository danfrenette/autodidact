# frozen_string_literal: true

module Autodidact
  Result = Data.define(:payload, :error) do
    def failure?
      !error.nil?
    end

    def success?
      error.nil?
    end
  end

  class Command
    def self.call(...)
      command = new
      command.call(...)
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
