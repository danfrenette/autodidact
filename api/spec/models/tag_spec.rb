# frozen_string_literal: true

require "rails_helper"

RSpec.describe Tag, type: :model do
  let_it_be(:user, refind: true) { create(:user) }
  let_it_be(:existing_tag, refind: true) { create(:tag, user: user, name: "databases") }

  describe "associations" do
    it { should belong_to(:user).class_name("Auth::User") }
    it { should have_many(:taggings).dependent(:destroy) }
    it { should have_many(:sources).through(:taggings) }
  end

  describe "validations" do
    subject(:tag) { build(:tag) }

    it { should validate_presence_of(:name) }

    it "validates name uniqueness scoped to user" do
      tag = build(:tag, user: user, name: existing_tag.name)

      expect(tag).not_to be_valid
      expect(tag.errors[:name]).to include("has already been taken")
    end
  end
end
