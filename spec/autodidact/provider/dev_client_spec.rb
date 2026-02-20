# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Provider::DevClient do
  let(:client) { described_class.new }

  describe "#chat" do
    it "returns stubbed markdown after a short delay" do
      start_time = Time.now
      result = client.chat(prompt: "any prompt")
      elapsed = Time.now - start_time

      expect(result).to include("Stubbed Concept")
      expect(result).to include("dev provider")
      expect(elapsed).to be >= 1.0
    end

    it "ignores access_token and model parameters" do
      client_with_params = described_class.new(access_token: "ignored", model: "ignored")
      result = client_with_params.chat(prompt: "test")

      expect(result).to include("Stubbed Concept")
    end
  end
end
