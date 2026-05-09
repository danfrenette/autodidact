# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::Lifecycle, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }

  describe ".call" do
    it "moves a draft source into uploading after creation" do
      source = create(:source, user: current_user)

      result = described_class.call(source: source, event: :created)

      expect(result).to be_success
      expect(source.reload.status).to eq("uploading")
    end

    it "moves an uploading source to uploaded after asset attachment" do
      source = create(:source, user: current_user, status: "uploading")

      result = described_class.call(source: source, event: :asset_attached)

      expect(result).to be_success
      expect(source.reload.status).to eq("uploaded")
    end

    it "moves an uploaded source to processing when processing starts" do
      source = create(:source, :uploaded, user: current_user)

      result = described_class.call(source: source, event: :processing_started)

      expect(result).to be_success
      expect(source.reload.status).to eq("processing")
    end

    it "derives complete when all selections are complete" do
      source = create(:source, :processing, user: current_user)
      create(:source_selection, :complete, source: source)
      create(:source_selection, :complete, source: source)

      result = described_class.call(source: source, event: :selection_statuses_changed)

      expect(result).to be_success
      expect(source.reload.status).to eq("complete")
    end

    it "derives failed when any selection failed" do
      source = create(:source, :processing, user: current_user)
      create(:source_selection, :complete, source: source)
      create(:source_selection, :failed, source: source)

      result = described_class.call(source: source, event: :selection_statuses_changed)

      expect(result).to be_success
      expect(source.reload.status).to eq("failed")
    end

    it "keeps processing while any selection is queued, confirmed, or processing" do
      source = create(:source, :processing, user: current_user)
      create(:source_selection, source: source, status: "queued")
      create(:source_selection, source: source, status: "confirmed")
      create(:source_selection, :processing, source: source)

      result = described_class.call(source: source, event: :selection_statuses_changed)

      expect(result).to be_success
      expect(source.reload.status).to eq("processing")
    end

    it "keeps an uploaded source uploaded when there are no selections" do
      source = create(:source, :uploaded, user: current_user)

      result = described_class.call(source: source, event: :selection_statuses_changed)

      expect(result).to be_success
      expect(source.reload.status).to eq("uploaded")
    end

    it "rejects impossible transitions" do
      source = create(:source, :complete, user: current_user)

      result = described_class.call(source: source, event: :processing_started)

      expect(result).to be_failure
      expect(result.errors).to include(/complete to processing/)
    end

    it "rejects unknown events" do
      source = create(:source, user: current_user)

      result = described_class.call(source: source, event: :unknown)

      expect(result).to be_failure
      expect(result.errors).to include(/unknown/)
    end
  end
end
