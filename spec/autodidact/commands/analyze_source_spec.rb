# frozen_string_literal: true

require "spec_helper"
require "tempfile"
require "tmpdir"

RSpec.describe Autodidact::Commands::AnalyzeSource do
  let(:notify) { proc { |**_| } }
  let(:blob) { double("SourceBlob", id: 42) }

  before do
    allow(Autodidact.config).to receive(:obsidian_vault_path).and_return(vault_dir)
    allow(Autodidact.config).to receive(:openai_access_token).and_return("sk-test")
    allow(Autodidact.config).to receive(:openai_model).and_return("gpt-4o-mini")
  end

  let(:vault_dir) { Dir.mktmpdir }

  after { FileUtils.rm_rf(vault_dir) }

  describe "success path" do
    it "returns note_path and source_blob_id" do
      file = Tempfile.new(["sample", ".txt"])
      file.write("some content")
      file.flush

      allow(Autodidact::Storage::PersistSourceBlob).to receive(:call).and_return(blob)
      allow(Autodidact::Analysis::GenerateNoteContent).to receive(:call).and_return("## Notes\n- point")

      result = described_class.call(params: {path: file.path}, notify: notify)

      expect(result.error).to be_nil
      expect(result.payload[:note_path]).to end_with(".md")
      expect(result.payload[:source_blob_id]).to eq(42)
      expect(File.exist?(result.payload[:note_path])).to be true
    ensure
      file.close!
    end
  end

  describe "PDF rejection" do
    it "returns a failure for PDF files" do
      file = Tempfile.new(["sample", ".pdf"])
      file.write("fake pdf")
      file.flush

      result = described_class.call(params: {path: file.path}, notify: notify)

      expect(result.payload).to be_nil
      expect(result.error[:message]).to include("PDF sources are not yet implemented")
    ensure
      file.close!
    end
  end

  describe "OpenAI failure" do
    it "returns a failure when analysis raises" do
      file = Tempfile.new(["sample", ".txt"])
      file.write("content")
      file.flush

      allow(Autodidact::Storage::PersistSourceBlob).to receive(:call).and_return(blob)
      allow(Autodidact::Analysis::GenerateNoteContent).to receive(:call)
        .and_raise(StandardError, "OpenAI analysis failed: rate limited")

      result = described_class.call(params: {path: file.path}, notify: notify)

      expect(result.payload).to be_nil
      expect(result.error[:message]).to include("rate limited")
    ensure
      file.close!
    end
  end

  describe "missing file" do
    it "returns a failure for nonexistent path" do
      result = described_class.call(params: {path: "/nope/missing.txt"}, notify: notify)

      expect(result.payload).to be_nil
      expect(result.error[:message]).to include("File not found")
    end
  end

  describe "notify progress" do
    it "emits progress stages in order" do
      file = Tempfile.new(["sample", ".txt"])
      file.write("content")
      file.flush

      allow(Autodidact::Storage::PersistSourceBlob).to receive(:call).and_return(blob)
      allow(Autodidact::Analysis::GenerateNoteContent).to receive(:call).and_return("notes")

      stages = []
      tracking_notify = proc { |**data| stages << data[:stage] }

      described_class.call(params: {path: file.path}, notify: tracking_notify)

      expect(stages).to eq(%w[detect_source ingest persist analyze write])
    ensure
      file.close!
    end
  end
end
