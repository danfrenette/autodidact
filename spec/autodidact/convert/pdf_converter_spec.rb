# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Convert::PdfConverter do
  describe ".call" do
    it "returns a failure with NotImplementedError" do
      result = described_class.call(path: "/some/file.pdf", source_type: "pdf")

      expect(result).to be_failure
      expect(result.error[:message]).to include("not yet implemented")
    end
  end
end
