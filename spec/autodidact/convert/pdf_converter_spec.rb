# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Convert::PdfConverter do
  describe ".call" do
    context "with a PDF that has no table of contents" do
      it "returns a ConversionResult with full text" do
        result = described_class.call(path: "spec/fixtures/without_toc.pdf", source_type: "pdf")

        expect(result).to be_success
        expect(result.payload).to be_a(Autodidact::ConversionResult)
        expect(result.payload.selection_kind).to eq("full")
      end
    end

    context "with a PDF that has a table of contents" do
      it "returns a PendingSelection payload" do
        result = described_class.call(path: "spec/fixtures/with_toc.pdf", source_type: "pdf")

        expect(result).to be_success
        expect(result.payload).to be_a(Autodidact::Commands::Payloads::PendingSelection)
        expect(result.payload.to_wire[:status]).to eq("pending_selection")
        expect(result.payload.to_wire[:chapters]).not_to be_empty
      end
    end

    context "with a specific chapter selected" do
      it "returns a ConversionResult for that chapter" do
        chapter = {title: "Introduction", page: 1}
        result = described_class.call(
          path: "spec/fixtures/with_toc.pdf",
          source_type: "pdf",
          chapter: chapter
        )

        expect(result).to be_success
        expect(result.payload).to be_a(Autodidact::ConversionResult)
        expect(result.payload.selection_kind).to eq("chapter")
        expect(result.payload.selection_payload[:title]).to eq("Introduction")
      end
    end
  end
end
