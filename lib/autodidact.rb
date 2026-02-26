# frozen_string_literal: true

require "zeitwerk"

module Autodidact
  def self.root
    @root ||= Pathname.new(File.expand_path("..", __dir__))
  end

  def self.config
    @config ||= Configuration.new
  end

  def self.reset_config!
    @config = nil
  end

  def self.loader
    @loader ||= Zeitwerk::Loader.for_gem.tap do |loader|
      loader.collapse(root.join("lib", "autodidact", "primitives"))
      loader.setup
    end
  end
end

Autodidact.loader
