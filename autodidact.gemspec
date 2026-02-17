# frozen_string_literal: true

require_relative "lib/autodidact/version"

Gem::Specification.new do |spec|
  spec.name = "autodidact"
  spec.version = Autodidact::VERSION
  spec.authors = ["Dan Frenette"]
  spec.summary = "Terminal tool for extracting and analyzing text from media for structured learning"

  spec.required_ruby_version = ">= 3.4.0"

  spec.files = Dir["lib/**/*", "bin/*", "templates/*"]
  spec.bindir = "bin"
  spec.executables = ["autodidact"]

  spec.add_dependency "dotenv"
  spec.add_dependency "faraday"
  spec.add_dependency "pg"
  spec.add_dependency "ruby-openai"
  spec.add_dependency "sequel"
  spec.add_dependency "zeitwerk"
end
