# frozen_string_literal: true

require "spec_helper"
require "tempfile"

RSpec.describe Autodidact::Ingest::TextIngestor do
  describe ".call" do
    it "reads entire file contents" do
      file = Tempfile.new(["test", ".txt"])
      file.write("line one\nline two\nline three\n")
      file.flush

      result = described_class.call(path: file.path)

      expect(result).to eq("line one\nline two\nline three")
    ensure
      file.close!
    end

    it "slices by line range when start_line and end_line given" do
      file = Tempfile.new(["test", ".txt"])
      file.write("alpha\nbeta\ngamma\ndelta\n")
      file.flush

      result = described_class.call(path: file.path, start_line: 2, end_line: 3)

      expect(result).to eq("beta\ngamma")
    ensure
      file.close!
    end

    it "returns empty string for out-of-bounds range" do
      file = Tempfile.new(["test", ".txt"])
      file.write("only one line\n")
      file.flush

      result = described_class.call(path: file.path, start_line: 5, end_line: 10)

      expect(result).to eq("")
    ensure
      file.close!
    end
  end
end
