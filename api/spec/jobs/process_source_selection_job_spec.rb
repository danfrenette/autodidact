# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProcessSourceSelectionJob, type: :job do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }
  let_it_be(:source, refind: true) { create(:source, :uploaded, user: current_user) }

  describe "#perform" do
    it "delegates to Sources::ProcessSelection" do
      selection = create(:source_selection, source: source)

      expect(Sources::ProcessSelection).to receive(:call)
        .with(source_selection: selection)
        .and_return(double(success?: true))

      described_class.perform_now(selection.id)
    end

    it "finds the selection by id and includes the source" do
      selection = create(:source_selection, source: source)

      allow(Sources::ProcessSelection).to receive(:call).and_return(double(success?: true))

      expect { described_class.perform_now(selection.id) }.not_to raise_error
    end
  end
end
