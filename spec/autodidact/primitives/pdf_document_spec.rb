# frozen_string_literal: true

require "spec_helper"

RSpec.describe Autodidact::PdfDocument do
  let(:with_toc) { described_class.new("spec/fixtures/with_toc.pdf") }
  let(:without_toc) { described_class.new("spec/fixtures/without_toc.pdf") }

  describe "#chapters" do
    context "without a table of contents" do
      it "returns an empty array" do
        expect(without_toc.chapters).to eq([])
      end
    end

    context "with a table of contents" do
      subject(:chapters) { with_toc.chapters }

      it "returns one entry per outline item" do
        expect(chapters.length).to eq(3)
      end

      it "returns hashes with id, title, and page keys" do
        expect(chapters).to all(include(:id, :title, :page))
      end

      it "returns unique ids for each chapter" do
        ids = chapters.map { |c| c[:id] }
        expect(ids).to eq(ids.uniq)
      end

      it "returns ids as 8-character hex strings" do
        expect(chapters.map { |c| c[:id] }).to all(match(/\A[0-9a-f]{8}\z/))
      end

      it "returns stable ids across calls" do
        expect(with_toc.chapters.map { |c| c[:id] }).to eq(with_toc.chapters.map { |c| c[:id] })
      end
      it "returns all titles as non-empty strings" do
        expect(chapters.map { |c| c[:title] }).to all(be_a(String).and(satisfy { |t| !t.empty? }))
      end

      it "returns page numbers as positive integers" do
        expect(chapters.map { |c| c[:page] }).to all(be_a(Integer).and(be_positive))
      end

      it "has no titles containing null bytes" do
        expect(chapters.map { |c| c[:title] }).to all(satisfy { |t| !t.include?("\x00") })
      end

      it "has no titles with leading or trailing whitespace" do
        expect(chapters.map { |c| c[:title] }).to all(satisfy { |t| t == t.strip })
      end

      describe "clean ASCII title" do
        it "decodes Introduction correctly" do
          expect(chapters).to include(include(title: "Introduction", page: 1))
        end

        it "decodes Chapter 2 correctly" do
          expect(chapters).to include(include(title: "Chapter 2", page: 2))
        end
      end

      describe "PDFDocEncoding title with em dash (0x84)" do
        it "decodes the em dash to the unicode character" do
          expect(chapters).to include(include(title: "Chapter 1\u2014Methods", page: 2))
        end
      end
    end
  end

  describe "#page_count" do
    it "returns the number of pages in the document" do
      expect(with_toc.page_count).to eq(2)
      expect(without_toc.page_count).to eq(1)
    end
  end

  describe "#page_text" do
    it "returns a string for a valid page" do
      expect(with_toc.page_text(1)).to be_a(String)
    end

    it "returns empty string for an out-of-range page" do
      expect(with_toc.page_text(999)).to eq("")
    end
  end

  describe "#pages_text" do
    it "returns joined text for a range of pages" do
      text = with_toc.pages_text(1..2)
      expect(text).to be_a(String)
      expect(text).not_to be_empty
    end
  end
end
