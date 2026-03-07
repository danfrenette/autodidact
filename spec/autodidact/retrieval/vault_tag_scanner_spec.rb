# frozen_string_literal: true

require "spec_helper"
require "tmpdir"

RSpec.describe Autodidact::Retrieval::VaultTagScanner do
  def write_note(dir, relative_path, content)
    full_path = File.join(dir, relative_path)
    FileUtils.mkdir_p(File.dirname(full_path))
    File.write(full_path, content)
  end

  def frontmatter(tags)
    yaml_tags = tags.map { |t| "  - #{t}" }.join("\n")
    "---\ntags:\n#{yaml_tags}\n---\n\nSome body text.\n"
  end

  describe "#call" do
    it "extracts tags from YAML frontmatter" do
      Dir.mktmpdir do |dir|
        write_note(dir, "note.md", frontmatter(%w[ruby rails]))

        result = described_class.new(vault_path: dir).call

        expect(result).to contain_exactly("ruby", "rails")
      end
    end

    it "scans nested directories" do
      Dir.mktmpdir do |dir|
        write_note(dir, "deep/nested/note.md", frontmatter(%w[elixir]))

        result = described_class.new(vault_path: dir).call

        expect(result).to contain_exactly("elixir")
      end
    end

    it "deduplicates tags across files" do
      Dir.mktmpdir do |dir|
        write_note(dir, "a.md", frontmatter(%w[ruby testing]))
        write_note(dir, "b.md", frontmatter(%w[ruby deployment]))

        result = described_class.new(vault_path: dir).call

        expect(result).to contain_exactly("ruby", "testing", "deployment")
      end
    end

    it "normalizes tags to lowercase with leading # stripped" do
      Dir.mktmpdir do |dir|
        content = "---\ntags:\n  - \"#Ruby\"\n  - \"##Rails\"\n  - TESTING\n---\n"
        write_note(dir, "note.md", content)

        result = described_class.new(vault_path: dir).call

        expect(result).to contain_exactly("ruby", "rails", "testing")
      end
    end

    it "skips files without frontmatter" do
      Dir.mktmpdir do |dir|
        write_note(dir, "no_front.md", "Just some plain text.\n")

        result = described_class.new(vault_path: dir).call

        expect(result).to be_empty
      end
    end

    it "skips files with frontmatter but no tags key" do
      Dir.mktmpdir do |dir|
        write_note(dir, "no_tags.md", "---\ntitle: Hello\n---\n\nBody.\n")

        result = described_class.new(vault_path: dir).call

        expect(result).to be_empty
      end
    end

    it "skips files with malformed YAML" do
      Dir.mktmpdir do |dir|
        write_note(dir, "bad.md", "---\ntags: [unclosed\n---\n")
        write_note(dir, "good.md", frontmatter(%w[valid]))

        result = described_class.new(vault_path: dir).call

        expect(result).to contain_exactly("valid")
      end
    end

    it "reads only the frontmatter, ignoring large body content" do
      Dir.mktmpdir do |dir|
        large_body = "x" * 10_000_000
        write_note(dir, "big_body.md", frontmatter(%w[efficient]) + large_body)

        result = described_class.new(vault_path: dir).call

        expect(result).to contain_exactly("efficient")
      end
    end

    it "rejects blank and empty tag values" do
      Dir.mktmpdir do |dir|
        write_note(dir, "note.md", "---\ntags:\n  - valid\n  - \"\"\n  - \"  \"\n---\n")

        result = described_class.new(vault_path: dir).call

        expect(result).to contain_exactly("valid")
      end
    end

    it "returns an empty set when vault path is nil" do
      result = described_class.new(vault_path: nil).call

      expect(result).to be_empty
    end

    it "returns an empty set when vault path does not exist" do
      result = described_class.new(vault_path: "/nonexistent/path").call

      expect(result).to be_empty
    end

    it "ignores non-markdown files" do
      Dir.mktmpdir do |dir|
        write_note(dir, "note.txt", frontmatter(%w[ignored]))
        write_note(dir, "real.md", frontmatter(%w[included]))

        result = described_class.new(vault_path: dir).call

        expect(result).to contain_exactly("included")
      end
    end

    it "handles flow-style YAML arrays" do
      Dir.mktmpdir do |dir|
        write_note(dir, "note.md", "---\ntags: [alpha, beta]\n---\n")

        result = described_class.new(vault_path: dir).call

        expect(result).to contain_exactly("alpha", "beta")
      end
    end

    it "handles frontmatter containing Date values" do
      Dir.mktmpdir do |dir|
        content = "---\ntags:\n  - ruby\ncreated: 2026-03-07\n---\n"
        write_note(dir, "note.md", content)

        result = described_class.new(vault_path: dir).call

        expect(result).to contain_exactly("ruby")
      end
    end
  end
end
