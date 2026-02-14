# frozen_string_literal: true

require "spec_helper"
require "tempfile"

RSpec.describe Autodidact::Services::DetectSource do
  let(:notify) { proc {} }

  describe "with a valid text file" do
    it "returns the path, source type, and line count" do
      file = Tempfile.new(["test", ".txt"])
      file.write("line one\nline two\nline three\n")
      file.flush

      result = described_class.call(params: {path: file.path}, notify: notify)

      expect(result.error).to be_nil
      expect(result.payload).to eq(
        path: file.path,
        source_type: "text",
        metadata: {line_count: 3}
      )
    ensure
      file.close!
    end
  end

  describe "with a valid pdf file" do
    it "returns the path, source type, and file size" do
      file = Tempfile.new(["test", ".pdf"])
      file.write("fake pdf content")
      file.flush

      result = described_class.call(params: {path: file.path}, notify: notify)

      expect(result.error).to be_nil
      expect(result.payload).to eq(
        path: file.path,
        source_type: "pdf",
        metadata: {file_size: File.size(file.path)}
      )
    ensure
      file.close!
    end
  end

  describe "with a missing file" do
    it "returns a failure result" do
      result = described_class.call(params: {path: "/nope/missing.txt"}, notify: notify)

      expect(result.payload).to be_nil
      expect(result.error[:message]).to include("File not found")
    end
  end

  describe "with an unsupported file type" do
    it "returns a failure result" do
      file = Tempfile.new(["test", ".zip"])
      file.flush

      result = described_class.call(params: {path: file.path}, notify: notify)

      expect(result.payload).to be_nil
      expect(result.error[:message]).to include("Unsupported file type")
    ensure
      file.close!
    end
  end
end
