# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::RefreshStatus, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }

  describe "#call" do
    it "sets status to uploaded when there are no selections" do
      source = create(:source, :uploaded, user: current_user)

      described_class.new(source: source).call

      expect(source.reload.status).to eq("uploaded")
    end

    it "sets status to complete when all selections are complete" do
      source = create(:source, user: current_user)
      create(:source_selection, :complete, source: source)
      create(:source_selection, :complete, source: source)

      described_class.new(source: source).call

      expect(source.reload.status).to eq("complete")
    end

    it "sets status to failed when any selection failed" do
      source = create(:source, user: current_user)
      create(:source_selection, :complete, source: source)
      create(:source_selection, :failed, source: source)

      described_class.new(source: source).call

      expect(source.reload.status).to eq("failed")
    end

    it "sets status to processing when any selection is in progress" do
      source = create(:source, user: current_user)
      create(:source_selection, :pending, source: source)
      create(:source_selection, :processing, source: source)

      described_class.new(source: source).call

      expect(source.reload.status).to eq("processing")
    end

    it "sets status to uploaded when selections are pending but none processing/failed" do
      source = create(:source, user: current_user)
      create(:source_selection, :pending, source: source)
      create(:source_selection, :pending, source: source)

      described_class.new(source: source).call

      expect(source.reload.status).to eq("uploaded")
    end
  end
end
