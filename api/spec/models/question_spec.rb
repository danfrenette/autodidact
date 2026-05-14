# frozen_string_literal: true

require "rails_helper"

RSpec.describe Question, type: :model do
  describe "associations" do
    it { should belong_to(:source_selection) }
    it { should have_many(:citations).dependent(:destroy) }
  end

  describe "validations" do
    subject(:question) { create(:question) }

    it { should validate_presence_of(:tier) }
    it { should validate_numericality_of(:tier).only_integer.is_greater_than_or_equal_to(1).is_less_than_or_equal_to(4) }
    it { should validate_presence_of(:tier_name) }
    it { should validate_presence_of(:text) }
    it { should validate_presence_of(:answer) }
    it { should validate_presence_of(:position) }
    it { should validate_numericality_of(:position).only_integer.is_greater_than_or_equal_to(0) }
    it { should validate_uniqueness_of(:position).scoped_to(:source_selection_id) }
  end
end
