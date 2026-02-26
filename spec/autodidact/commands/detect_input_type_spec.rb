# frozen_string_literal: true

require "spec_helper"
require "tempfile"

RSpec.describe Autodidact::Commands::DetectInputType do
  it "detects url input" do
    result = described_class.call(input: "https://example.com/article")

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_type: "url")
  end

  it "detects file_path input when file exists" do
    file = Tempfile.new(["sample", ".txt"])
    file.write("hello")
    file.flush

    result = described_class.call(input: file.path)

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_type: "file_path")
  ensure
    file.close!
  end

  it "detects raw_text for multiline prose" do
    input = "This is a sentence.\nAnd this is another sentence."
    result = described_class.call(input: input)

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_type: "raw_text")
  end

  it "defaults to file_path for path-like non-existent input" do
    result = described_class.call(input: "./notes/chapter1.txt")

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_type: "file_path")
  end
end
