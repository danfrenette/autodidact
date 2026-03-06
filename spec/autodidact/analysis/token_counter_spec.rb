# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Analysis::TokenCounter do
  describe ".call" do
    it "returns zero for nil text" do
      result = described_class.call(text: nil)

      expect(result).to be_success
      expect(result.payload).to eq(0)
    end

    it "returns zero for blank text" do
      result = described_class.call(text: "   ")

      expect(result).to be_success
      expect(result.payload).to eq(0)
    end

    it "returns a positive token count for non-empty text" do
      result = described_class.call(text: "Hello, world!")

      expect(result).to be_success
      expect(result.payload).to be_a(Integer)
      expect(result.payload).to be > 0
    end

    it "returns a higher count for longer text" do
      short = described_class.call(text: "Hello").payload
      long = described_class.call(text: "Hello " * 100).payload

      expect(long).to be > short
    end
  end
end
