# frozen_string_literal: true

module Autodidact
  class Route
    def self.call(params:, notify:)
      new(params: params, notify: notify).call
    end

    def initialize(params:, notify:)
      @params = params
      @notify = notify
    end

    private

    attr_reader :params, :notify
  end
end
