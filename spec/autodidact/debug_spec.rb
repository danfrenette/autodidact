# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Debug do
  describe ".remote_pry" do
    before do
      allow(described_class).to receive(:require).with("pry-remote")
    end

    it "calls remote_pry on the target" do
      target = double("target", remote_pry: nil)

      described_class.remote_pry(target)

      expect(target).to have_received(:remote_pry)
    end

    it "redirects $stdout to $stderr during the call" do
      target = double("target")
      allow(target).to receive(:remote_pry) { expect($stdout).to eq($stderr) }

      described_class.remote_pry(target)
    end

    it "restores $stdout after the call" do
      original = $stdout
      target = double("target", remote_pry: nil)

      described_class.remote_pry(target)

      expect($stdout).to eq(original)
    end
  end
end
