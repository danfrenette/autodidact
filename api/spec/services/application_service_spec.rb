# frozen_string_literal: true

require "rails_helper"

class TestApplicationService < ApplicationService
  Result = ApplicationResult.define(:record)

  def call
    success(record: "source")
  end
end

class TestApplicationServiceWithoutResult < ApplicationService
  def call
    failure
  end
end

RSpec.describe ApplicationService, type: :service do
  it "returns the service result class from success" do
    result = TestApplicationService.call

    expect(result).to be_a(TestApplicationService::Result)
    expect(result).to be_success
    expect(result.record).to eq("source")
  end

  it "returns ApplicationResult from failure when no attributes are needed" do
    result = TestApplicationServiceWithoutResult.call

    expect(result).to be_a(ApplicationResult)
    expect(result).to be_failure
  end
end
