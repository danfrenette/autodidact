# frozen_string_literal: true

require "rails_helper"

RSpec.describe SourceSelection, type: :model do
  describe "associations" do
    it { should belong_to(:source) }
    it { should have_one(:source_selection_content).dependent(:destroy) }
    it { should have_many(:concepts).dependent(:destroy) }
    it { should have_many(:questions).dependent(:destroy) }
    it { should have_many(:quotes).dependent(:destroy) }
    it { should have_many(:taggings).dependent(:destroy) }
    it { should have_many(:tags).through(:taggings) }
  end

  describe "validations" do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:label) }
    it { should validate_presence_of(:position) }
    it { should validate_presence_of(:locator) }
  end

  describe "enums" do
    it { should define_enum_for(:kind).with_values(chapter: "chapter").backed_by_column_of_type(:string) }
    it { should define_enum_for(:status).with_values(pending: "pending", confirmed: "confirmed", queued: "queued", processing: "processing", complete: "complete", failed: "failed").backed_by_column_of_type(:string) }
  end

  describe "#terminal?" do
    it "treats complete and failed selections as terminal" do
      expect(build(:source_selection, status: "complete")).to be_terminal
      expect(build(:source_selection, status: "failed")).to be_terminal
      expect(build(:source_selection, status: "processing")).not_to be_terminal
    end
  end
end
