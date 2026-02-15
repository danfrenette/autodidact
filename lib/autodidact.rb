# frozen_string_literal: true

require "pathname"
require "zeitwerk"

module Autodidact
  def self.root
    @root ||= Pathname.new(File.expand_path("..", __dir__))
  end

  def self.config
    @config ||= Configuration.new
  end

  def self.loader
    @loader ||= Zeitwerk::Loader.for_gem.tap(&:setup)
  end
end

Autodidact.loader
