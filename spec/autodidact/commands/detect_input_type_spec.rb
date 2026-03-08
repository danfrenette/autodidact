# frozen_string_literal: true

require "spec_helper"
require "tempfile"

RSpec.describe Autodidact::Commands::DetectInputType do
  it "detects url input" do
    result = described_class.call(input: "https://example.com/article")

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_type: "url")
  end

  it "detects file_path when the file exists" do
    file = Tempfile.new(["sample", ".txt"])
    file.write("hello")
    file.flush

    result = described_class.call(input: file.path)

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_type: "file_path")
  ensure
    file.close!
  end

  it "detects raw_text for multiline input" do
    input = "This is a sentence.\nAnd this is another sentence."
    result = described_class.call(input: input)

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_type: "raw_text")
  end

  it "detects raw_text for pasted markdown with frontmatter" do
    input = <<~MARKDOWN
      ---
      title: "Some Article"
      tags:
        - "clippings"
      ---
      Here is the body of the article with paths like src/foo/bar.ts in it.
    MARKDOWN
    result = described_class.call(input: input)

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_type: "raw_text")
  end

  it "detects raw_text for single-line input that looks path-like but does not exist" do
    result = described_class.call(input: "./notes/chapter1.txt")

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_type: "raw_text")
  end

  it "detects file_path for a shell-escaped dropped path" do
    Dir.mktmpdir do |dir|
      path = File.join(dir, "sample notes.txt")
      File.write(path, "hello")

      escaped_path = path.gsub(" ", "\\ ")
      result = described_class.call(input: escaped_path)

      expect(result.error).to be_nil
      expect(result.payload).to eq(input_type: "file_path")
    end
  end

  it "detects raw_text for plain prose" do
    result = described_class.call(input: "Just a simple sentence.")

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_type: "raw_text")
  end
end
