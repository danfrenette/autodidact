# frozen_string_literal: true

require "rails_helper"

RSpec.describe Sources::SelectionReconciler, type: :service do
  describe "#call" do
    it "reconciles selections when parser titles differ but locator and ordinal match" do
      source = create(:source, :uploaded)
      selection = create(
        :source_selection,
        :pending,
        source: source,
        title: "\u00A0Foreword",
        label: "01",
        position: {ordinal: 1},
        locator: {type: "page_range", start: 13, end: 13}
      )
      inspector_result = {
        subsections: [
          {
            title: "Foreword",
            label: "01",
            position: {ordinal: 1},
            locator: {type: "page_range", start: 13, end: 13}
          }
        ]
      }

      attach_pdf(source)
      allow(Sources::Inspector).to receive(:new)
        .and_return(instance_double(Sources::Inspector, call: inspector_result))

      result = described_class.call(source: source)

      expect(result).to be_success
      expect(result.resolved_selections).to contain_exactly(
        hash_including(selection: selection, title: "Foreword")
      )
    end
  end

  def attach_pdf(source)
    source.asset.attach(
      io: File.open("/Users/dan/code/substrate/spec/fixtures/with_toc.pdf"),
      filename: "with_toc.pdf",
      content_type: "application/pdf"
    )
  end
end
