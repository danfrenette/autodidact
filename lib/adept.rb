# frozen_string_literal: true

require 'zeitwerk'

module Adept
  def self.loader
    @loader ||= Zeitwerk::Loader.for_gem.tap do |loader|
      loader.setup
    end
  end
end

Adept.loader
