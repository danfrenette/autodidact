# frozen_string_literal: true

require "rails_helper"

RSpec.describe Tagging, type: :model do
  let_it_be(:user, refind: true) { create(:user) }
  let_it_be(:source, refind: true) { create(:source, user: user) }
  let_it_be(:tag, refind: true) { create(:tag, user: user) }
  let_it_be(:existing_tagging, refind: true) { create(:tagging, tag: tag, taggable: source) }

  describe "associations" do
    it { should belong_to(:tag) }
    it { should belong_to(:taggable) }
  end

  describe "validations" do
    subject(:tagging) { build(:tagging) }

    it "validates tag uniqueness scoped to taggable" do
      tagging = build(:tagging, tag: tag, taggable: source)

      expect(tagging).not_to be_valid
      expect(tagging.errors[:tag_id]).to include("has already been taken")
    end
  end
end
