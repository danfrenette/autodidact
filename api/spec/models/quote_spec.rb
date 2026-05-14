# frozen_string_literal: true

require "rails_helper"

RSpec.describe Quote, type: :model do
  describe "associations" do
    it { should belong_to(:source_selection) }
    it { should have_many(:citations).dependent(:destroy) }
  end

  describe "validations" do
    subject(:quote) { create(:quote) }

    it { should validate_presence_of(:text) }
    it { should validate_presence_of(:position) }
    it { should validate_numericality_of(:position).only_integer.is_greater_than_or_equal_to(0) }
    it { should validate_uniqueness_of(:position).scoped_to(:source_selection_id) }
  end
end
