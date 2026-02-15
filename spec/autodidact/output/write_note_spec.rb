# frozen_string_literal: true

require "spec_helper"
require "tmpdir"

RSpec.describe Autodidact::Output::WriteNote do
  describe ".call" do
    it "writes rendered content to the vault path" do
      Dir.mktmpdir do |dir|
        result = described_class.call(
          vault_path: dir,
          filename: "test-note.md",
          rendered_content: "# Hello\nworld"
        )

        expect(result).to eq(Pathname.new(dir).join("test-note.md"))
        expect(File.read(result)).to eq("# Hello\nworld")
      end
    end

    it "returns the full destination path as a Pathname" do
      Dir.mktmpdir do |dir|
        result = described_class.call(
          vault_path: dir,
          filename: "note.md",
          rendered_content: "content"
        )

        expect(result).to be_a(Pathname)
        expect(result.to_s).to end_with("note.md")
      end
    end
  end
end
