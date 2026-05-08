# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::CreateSelection, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }
  let_it_be(:source, refind: true) { create(:source, user: current_user) }

  describe "#call" do
    it "creates a selection with valid params" do
      result = described_class.call(
        source: source,
        params: {
          kind: "chapter",
          title: "New Chapter",
          label: "05",
          position: {ordinal: 5},
          locator: {type: "page_range", start: 100, end: 120}
        }
      )

      expect(result).to be_success
      expect(result.selection).to be_persisted
      expect(result.selection.title).to eq("New Chapter")
      expect(result.selection.source).to eq(source)
    end

    it "returns failure when params are invalid" do
      result = described_class.call(
        source: source,
        params: {title: ""}
      )

      expect(result).not_to be_success
      expect(result.errors).not_to be_empty
    end
  end
end
