# frozen_string_literal: true

require "rails_helper"

RSpec.describe ApplicationResult, type: :service do
  it "exposes success state" do
    result = described_class.new(success: true)

    expect(result).to be_success
    expect(result).not_to be_failure
    expect(result.errors).to eq([])
  end

  it "exposes failure state" do
    result = described_class.new(success: false, errors: ["Title can't be blank"])

    expect(result).not_to be_success
    expect(result).to be_failure
    expect(result.errors).to eq(["Title can't be blank"])
  end

  it "defines result classes with explicit readers" do
    result_class = described_class.define(:source)
    result = result_class.new(success: true, source: "source")

    expect(result).to be_a(described_class)
    expect(result).to be_success
    expect(result.source).to eq("source")
    expect(result.errors).to eq([])
  end
end
