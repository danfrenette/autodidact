# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::ApplicationCommand do
  let(:notify) { proc {} }

  describe ".call" do
    it "rescues StandardError into a failure result" do
      stub_const("TestCommand", Class.new(described_class) do
        def call(params:, notify:)
          raise StandardError, "boom"
        end
      end)

      result = TestCommand.call(params: {}, notify: notify)

      expect(result.payload).to be_nil
      expect(result.error).to eq(message: "boom")
    end
  end

  describe "#success" do
    it "returns a Result with payload and nil error" do
      command = described_class.new
      result = command.success(payload: {status: "ok"})

      expect(result.payload).to eq(status: "ok")
      expect(result.error).to be_nil
    end
  end

  describe "#failure" do
    it "returns a Result with nil payload and error message" do
      command = described_class.new
      result = command.failure(StandardError.new("oops"))

      expect(result.payload).to be_nil
      expect(result.error).to eq(message: "oops")
    end
  end
end
