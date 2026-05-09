# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::ProcessSelection, type: :service do
  let_it_be(:current_user, refind: true) { create(:user, id: "user_123") }
  let_it_be(:successful_processing_source, refind: true) { create(:source, :processing, user: current_user) }
  let_it_be(:failed_processing_source, refind: true) { create(:source, :processing, user: current_user) }

  describe ".call" do
    it "marks the selection complete when distillation succeeds" do
      selection = create(:source_selection, :processing, source: successful_processing_source)
      allow_successful_distillation(selection)

      result = described_class.call(source_selection: selection)

      expect(result).to be_success
      expect(selection.reload.status).to eq("complete")
      expect(selection.error_message).to be_nil
      expect(successful_processing_source.reload.status).to eq("complete")
    end

    it "returns failure, marks the selection failed, and refreshes source status when distillation fails" do
      selection = create(:source_selection, :processing, source: failed_processing_source)
      allow_failed_distillation(selection, RuntimeError.new("Distillation failed"))

      result = described_class.call(source_selection: selection)

      expect(result).to be_failure
      expect(result.error_message).to eq("Distillation failed")
      expect(selection.reload.status).to eq("failed")
      expect(selection.error_message).to eq("Distillation failed")
      expect(failed_processing_source.reload.status).to eq("failed")
    end
  end

  def allow_successful_distillation(selection)
    allow_selection_file(selection)
    allow(Substrate::Distill).to receive(:call).and_return(double(failure?: false))
  end

  def allow_failed_distillation(selection, error)
    allow_selection_file(selection)
    allow(Substrate::Distill).to receive(:call).and_return(double(failure?: true, error: error))
  end

  def allow_selection_file(selection)
    source = selection.source
    asset = double(open: nil)
    pdf = instance_double(Substrate::Sources::Pdf, select_pages: "selected pages")
    file = instance_double(File, path: "/tmp/source.pdf")

    allow(selection).to receive(:source).and_return(source)
    allow(source).to receive(:asset).and_return(asset)
    allow(asset).to receive(:open).and_yield(file)
    allow(Substrate::Sources::Pdf).to receive(:new).with(file.path).and_return(pdf)
  end
end
