# frozen_string_literal: true

require "rails_helper"

RSpec.describe Citation, type: :model do
  describe "associations" do
    it { should belong_to(:citable) }
    it { should belong_to(:source_chunk) }
  end

  describe "validations" do
    subject(:citation) { create(:citation) }

    it { should validate_presence_of(:role) }
    it { should validate_presence_of(:position) }
    it { should validate_numericality_of(:position).only_integer.is_greater_than_or_equal_to(0) }
    it { should validate_uniqueness_of(:position).scoped_to(:citable_type, :citable_id) }
  end

  describe "enums" do
    it { should define_enum_for(:role).with_values(supporting: "supporting", quote_source: "quote_source", answer_source: "answer_source", connection_source: "connection_source").backed_by_column_of_type(:string) }
  end
end
