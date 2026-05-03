# frozen_string_literal: true

require "rails_helper"

RSpec.describe Source, type: :model do
  describe "associations" do
    it { should belong_to(:user).class_name("Auth::User") }
    it { should have_many(:source_selections).dependent(:destroy) }
    it { should have_one_attached(:asset) }
  end

  describe "validations" do
    it { should validate_presence_of(:title) }
  end

  describe "enums" do
    it { should define_enum_for(:status).with_values(draft: "draft", uploading: "uploading", uploaded: "uploaded", processing: "processing", complete: "complete", failed: "failed").backed_by_column_of_type(:string) }
    it { should define_enum_for(:kind).with_values(pdf: "pdf", audio: "audio", video: "video", text: "text", url: "url").backed_by_column_of_type(:string) }
  end

  describe "#progress_stats" do
    it "returns correct counts and percentage for mixed status selections" do
      source = build(:source)
      selections = [
        build_stubbed(:source_selection, status: "complete"),
        build_stubbed(:source_selection, status: "complete"),
        build_stubbed(:source_selection, status: "pending"),
        build_stubbed(:source_selection, status: "processing")
      ]
      allow(source).to receive(:source_selections).and_return(selections)

      stats = source.progress_stats

      expect(stats).to eq(selection_count: 4, completed_count: 2, percentage: 50)
    end

    it "returns 100% when all selections are complete" do
      source = build(:source)
      selections = build_stubbed_list(:source_selection, 3, status: "complete")
      allow(source).to receive(:source_selections).and_return(selections)

      stats = source.progress_stats

      expect(stats).to eq(selection_count: 3, completed_count: 3, percentage: 100)
    end

    it "returns 0% when no selections are complete" do
      source = build(:source)
      selections = [
        *build_stubbed_list(:source_selection, 2, status: "pending"),
        build_stubbed(:source_selection, status: "processing")
      ]
      allow(source).to receive(:source_selections).and_return(selections)

      stats = source.progress_stats

      expect(stats).to eq(selection_count: 3, completed_count: 0, percentage: 0)
    end
  end
end
