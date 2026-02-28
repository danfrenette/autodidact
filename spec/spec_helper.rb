# frozen_string_literal: true

require "autodidact"
require "climate_control"
require "support/result_helpers"

RSpec.configure do |config|
  config.include ResultHelpers

  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end
end
