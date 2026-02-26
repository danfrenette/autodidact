# frozen_string_literal: true

require "spec_helper"
require "tempfile"

RSpec.describe Autodidact::Commands::DetectInputKind do
  let(:notify) { proc {} }

  it "detects url input" do
    result = described_class.call(params: {path: "https://example.com/article"}, notify: notify)

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_kind: "url")
  end

  it "detects file_path input when file exists" do
    file = Tempfile.new(["sample", ".txt"])
    file.write("hello")
    file.flush

    result = described_class.call(params: {path: file.path}, notify: notify)

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_kind: "file_path")
  ensure
    file.close!
  end

  it "detects raw_text for multiline prose" do
    input = "This is a sentence.\nAnd this is another sentence."
    result = described_class.call(params: {path: input}, notify: notify)

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_kind: "raw_text")
  end

  it "defaults to file_path for path-like non-existent input" do
    result = described_class.call(params: {path: "./notes/chapter1.txt"}, notify: notify)

    expect(result.error).to be_nil
    expect(result.payload).to eq(input_kind: "file_path")
  end
end
