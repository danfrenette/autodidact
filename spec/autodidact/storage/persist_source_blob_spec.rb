# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::Storage::PersistSourceBlob do
  let(:blob) { double("SourceBlob", id: "abc-123", add_tag: nil) }
  let(:tag) { double("Tag", id: "tag-1", name: "study-guide") }

  before do
    allow(Autodidact::Models::SourceBlob).to receive(:create).and_return(blob)
  end

  describe ".call" do
    let(:base_params) do
      {
        source_path: "/path/to/file.txt",
        source_type: "text",
        selection_kind: "full",
        raw_text: "some content"
      }
    end

    it "creates a source blob record" do
      described_class.call(**base_params)

      expect(Autodidact::Models::SourceBlob).to have_received(:create).with(
        source_path: "/path/to/file.txt",
        source_type: "text",
        selection_kind: "full",
        selection_payload: Sequel.pg_jsonb({}),
        raw_text: "some content"
      )
    end

    it "returns the created blob" do
      result = described_class.call(**base_params)

      expect(result).to eq(blob)
    end

    context "with tags" do
      before do
        allow(Autodidact::Models::Tag).to receive(:find_or_create).and_return(tag)
      end

      it "finds or creates tags and associates them with the blob" do
        described_class.call(**base_params, tags: %w[study-guide chapter-review])

        expect(Autodidact::Models::Tag).to have_received(:find_or_create).with(name: "study-guide")
        expect(Autodidact::Models::Tag).to have_received(:find_or_create).with(name: "chapter-review")
        expect(blob).to have_received(:add_tag).with(tag).twice
      end
    end

    context "without tags" do
      it "does not attempt to create or associate tags" do
        allow(Autodidact::Models::Tag).to receive(:find_or_create)

        described_class.call(**base_params)

        expect(Autodidact::Models::Tag).not_to have_received(:find_or_create)
        expect(blob).not_to have_received(:add_tag)
      end
    end

    context "with empty tags array" do
      it "does not attempt to create or associate tags" do
        allow(Autodidact::Models::Tag).to receive(:find_or_create)

        described_class.call(**base_params, tags: [])

        expect(Autodidact::Models::Tag).not_to have_received(:find_or_create)
        expect(blob).not_to have_received(:add_tag)
      end
    end

    context "with tags needing normalization" do
      before do
        allow(Autodidact::Models::Tag).to receive(:find_or_create).and_return(tag)
      end

      it "strips whitespace and lowercases tag names" do
        described_class.call(**base_params, tags: ["  Study-Guide  ", " KEY-TERMS"])

        expect(Autodidact::Models::Tag).to have_received(:find_or_create).with(name: "study-guide")
        expect(Autodidact::Models::Tag).to have_received(:find_or_create).with(name: "key-terms")
      end

      it "skips empty strings after normalization" do
        described_class.call(**base_params, tags: ["  ", "", "study-guide"])

        expect(Autodidact::Models::Tag).to have_received(:find_or_create).once.with(name: "study-guide")
        expect(blob).to have_received(:add_tag).once
      end

      it "handles non-string tag values by converting to string" do
        described_class.call(**base_params, tags: [:summary, 123])

        expect(Autodidact::Models::Tag).to have_received(:find_or_create).with(name: "summary")
        expect(Autodidact::Models::Tag).to have_received(:find_or_create).with(name: "123")
      end
    end
  end
end
