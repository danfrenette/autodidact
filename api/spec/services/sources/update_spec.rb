# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::Update, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }
  let_it_be(:source, refind: true) { create(:source, user: current_user) }

  describe "#call" do
    it "updates the source with valid params" do
      result = described_class.new(
        source: source,
        params: {title: "Updated Title"}
      ).call

      expect(result).to be_success
      expect(result.source.title).to eq("Updated Title")
    end

    it "returns failure when params are invalid" do
      result = described_class.new(
        source: source,
        params: {title: ""}
      ).call

      expect(result).not_to be_success
      expect(result.errors).to include(/Title/)
    end
  end
end
