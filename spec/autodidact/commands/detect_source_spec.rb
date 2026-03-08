# frozen_string_literal: true

require "spec_helper"
require "tempfile"
require "tmpdir"

RSpec.describe Autodidact::Commands::DetectSource do
  describe "with a valid text file" do
    it "returns the path, source type, and line count" do
      file = Tempfile.new(["test", ".txt"])
      file.write("line one\nline two\nline three\n")
      file.flush

      result = described_class.call(path: file.path)

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

      result = described_class.call(path: file.path)

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
      result = described_class.call(path: "/nope/missing.txt")

      expect(result.payload).to be_nil
      expect(result.error[:message]).to include("File not found")
    end
  end

  describe "with a relative path" do
    it "expands to an absolute path" do
      Dir.mktmpdir do |dir|
        source_path = File.join(dir, "sample.txt")
        File.write(source_path, "line one\n")

        Dir.chdir(dir) do
          expanded_path = File.expand_path("sample.txt")
          result = described_class.call(path: "sample.txt")

          expect(result.error).to be_nil
          expect(result.payload).to eq(
            path: expanded_path,
            source_type: "text",
            metadata: {line_count: 1}
          )
        end
      end
    end
  end

  describe "with a shell-escaped dropped path" do
    it "unescapes the path before reading the file" do
      Dir.mktmpdir do |dir|
        path = File.join(dir, "sample notes.txt")
        File.write(path, "line one\nline two\n")

        result = described_class.call(path: path.gsub(" ", "\\ "))

        expect(result.error).to be_nil
        expect(result.payload).to eq(
          path: path,
          source_type: "text",
          metadata: {line_count: 2}
        )
      end
    end
  end

  describe "with an unsupported file type" do
    it "returns a failure result" do
      file = Tempfile.new(["test", ".zip"])
      file.flush

      result = described_class.call(path: file.path)

      expect(result.payload).to be_nil
      expect(result.error[:message]).to include("Unsupported file type")
    ensure
      file.close!
    end
  end
end
