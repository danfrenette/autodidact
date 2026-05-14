# frozen_string_literal: true

require "rails_helper"

RSpec.describe SourceChunk, type: :model do
  describe "associations" do
    it { should belong_to(:source_selection_content) }
    it { should have_many(:citations).dependent(:destroy) }
  end

  describe "validations" do
    subject(:source_chunk) { create(:source_chunk) }

    it { should validate_presence_of(:chunk_index) }
    it { should validate_numericality_of(:chunk_index).is_greater_than_or_equal_to(0) }
    it { should validate_presence_of(:content) }
    it { should validate_presence_of(:token_count) }
    it { should validate_numericality_of(:token_count).is_greater_than(0) }
    it { should validate_presence_of(:chunk_id) }
    it { should validate_presence_of(:byte_offset) }
    it { should validate_numericality_of(:byte_offset).is_greater_than_or_equal_to(0) }
    it { should validate_presence_of(:byte_length) }
    it { should validate_numericality_of(:byte_length).is_greater_than(0) }
    it { should validate_uniqueness_of(:chunk_index).scoped_to(:source_selection_content_id) }
  end
end
