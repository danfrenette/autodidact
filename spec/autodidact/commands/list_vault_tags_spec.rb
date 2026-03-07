# frozen_string_literal: true

require "spec_helper"
require "tmpdir"

RSpec.describe Autodidact::Commands::ListVaultTags do
  let(:vault_dir) { Dir.mktmpdir }
  let(:notify) { proc {} }

  after { FileUtils.rm_rf(vault_dir) }

  def write_note(relative_path, content)
    full_path = File.join(vault_dir, relative_path)
    FileUtils.mkdir_p(File.dirname(full_path))
    File.write(full_path, content)
  end

  def frontmatter(tags)
    yaml_tags = tags.map { |t| "  - #{t}" }.join("\n")
    "---\ntags:\n#{yaml_tags}\n---\n\nBody.\n"
  end

  describe ".call" do
    before do
      allow(Autodidact.config).to receive(:obsidian_vault_path).and_return(vault_dir)
    end

    it "returns vault tags sorted alphabetically" do
      write_note("a.md", frontmatter(%w[zebra alpha]))

      result = described_class.call(params: {}, notify: notify)

      expect(result).to be_success
      expect(result.payload[:tags]).to eq(%w[alpha zebra])
    end

    it "merges vault tags with database tags", :db do
      write_note("a.md", frontmatter(%w[vault-tag]))
      Autodidact::Models::Tag.create(name: "db-tag")

      result = described_class.call(params: {}, notify: notify)

      expect(result).to be_success
      expect(result.payload[:tags]).to include("vault-tag", "db-tag")
    end

    it "deduplicates tags present in both vault and database", :db do
      write_note("a.md", frontmatter(%w[shared-tag vault-only]))
      Autodidact::Models::Tag.create(name: "shared-tag")
      Autodidact::Models::Tag.create(name: "db-only")

      result = described_class.call(params: {}, notify: notify)

      expect(result).to be_success
      expect(result.payload[:tags]).to eq(%w[db-only shared-tag vault-only])
    end

    it "returns only database tags when vault path is nil", :db do
      allow(Autodidact.config).to receive(:obsidian_vault_path).and_return(nil)
      Autodidact::Models::Tag.create(name: "db-tag")

      result = described_class.call(params: {}, notify: notify)

      expect(result).to be_success
      expect(result.payload[:tags]).to eq(%w[db-tag])
    end

    it "returns empty tags when vault is empty and database has no tags" do
      result = described_class.call(params: {}, notify: notify)

      expect(result).to be_success
      expect(result.payload[:tags]).to eq([])
    end
  end
end
