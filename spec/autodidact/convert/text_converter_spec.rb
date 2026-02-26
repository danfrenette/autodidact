# frozen_string_literal: true

require "spec_helper"
require "tempfile"

RSpec.describe Autodidact::Convert::TextConverter do
  describe ".call" do
    it "returns a ConversionResult with file contents" do
      file = Tempfile.new(["test", ".txt"])
      file.write("line one\nline two\nline three\n")
      file.flush

      result = described_class.call(path: file.path, source_type: "text")

      expect(result).to be_success
      expect(result.payload.raw_text).to eq("line one\nline two\nline three\n")
      expect(result.payload.source_path).to eq(file.path)
      expect(result.payload.source_type).to eq("text")
      expect(result.payload.selection_kind).to eq("full")
      expect(result.payload.note_filename).to end_with(".md")
    ensure
      file.close!
    end

    it "returns a failure for nonexistent file" do
      result = described_class.call(path: "/nope/missing.txt", source_type: "text")

      expect(result).to be_failure
    end
  end
end
