# frozen_string_literal: true

require "rails_helper"

RSpec.describe SourceSelectionContent, type: :model do
  describe "associations" do
    it { should belong_to(:source_selection) }
    it { should have_many(:source_chunks).dependent(:destroy) }
  end

  describe "validations" do
    subject(:content) { build(:source_selection_content) }

    it { should validate_presence_of(:raw_text) }

    it "validates source selection uniqueness" do
      existing = create(:source_selection_content)
      duplicate = build(:source_selection_content, source_selection: existing.source_selection)

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:source_selection_id]).to include("has already been taken")
    end
  end
end
