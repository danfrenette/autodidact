# frozen_string_literal: true

require "rails_helper"

RSpec.describe Tags::FindOrCreate, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }

  describe "#call" do
    it "normalizes tags and tags the record" do
      source = create(:source, user: current_user)

      result = described_class.call(
        user: current_user,
        taggable: source,
        tag_names: [" Distributed Systems ", "distributed   systems", "Databases"]
      )

      expect(result).to be_success
      expect(result.tags.map(&:name)).to eq(["distributed-systems", "databases"])
      expect(source.tags.reload.pluck(:name)).to contain_exactly("distributed-systems", "databases")
      expect(Tagging.pluck(:taggable_type).uniq).to eq(["Source"])
    end

    it "reuses existing tags for the same user" do
      source = create(:source, user: current_user)
      existing_tag = create(:tag, user: current_user, name: "databases")

      expect {
        described_class.call(user: current_user, taggable: source, tag_names: ["Databases"])
      }.not_to change(Tag, :count)

      expect(source.tags.reload).to contain_exactly(existing_tag)
    end
  end
end
