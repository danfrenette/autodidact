# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Commands::Ping do
  let(:notify) { proc {} }

  it "returns a success result with status and version" do
    result = described_class.call(params: {}, notify: notify)

    expect(result.payload).to eq(status: "ok", version: Autodidact::VERSION)
    expect(result.error).to be_nil
  end
end
