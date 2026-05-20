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

    it "marks the selection failed when processing raises after the selection is loaded" do
      source.update!(status: :processing)
      selection = create(:source_selection, :processing, source: source)
      allow(Sources::ProcessSelection).to receive(:call).and_raise(JSON::ParserError, "unexpected token")

      described_class.perform_now(selection.id)

      expect(selection.reload).to be_failed
      expect(selection.error_message).to eq("Processing job failed: unexpected token")
      expect(selection.error_details).to include(
        "stage" => "PROCESS",
        "code" => "job_failed",
        "action" => "retry",
        "error_class" => "JSON::ParserError"
      )
      expect(source.reload).to be_failed
    end
  end
end
