# frozen_string_literal: true

require 'zeitwerk'

module Autodidact
  def self.loader
    @loader ||= Zeitwerk::Loader.for_gem.tap(&:setup)
  end
end

Autodidact.loader
