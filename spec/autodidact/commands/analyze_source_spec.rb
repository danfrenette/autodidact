# frozen_string_literal: true

require "spec_helper"
require "tempfile"
require "tmpdir"

RSpec.describe Autodidact::Commands::AnalyzeSource do
  let(:notify) { proc { |**_| } }
  let(:blob) { double("SourceBlob", id: 42) }

  before do
    allow(Autodidact.config).to receive(:ready?).and_return(true)
    allow(Autodidact.config).to receive(:obsidian_vault_path).and_return(vault_dir)
    allow(Autodidact.config).to receive(:access_token).and_return("sk-test")
    allow(Autodidact.config).to receive(:model).and_return("gpt-4o-mini")
  end

  let(:vault_dir) { Dir.mktmpdir }

  after { FileUtils.rm_rf(vault_dir) }

  describe "success path" do
    it "returns note_path and source_blob_id" do
      file = Tempfile.new(["sample", ".txt"])
      file.write("some content")
      file.flush

      allow(Autodidact::Storage::PersistSourceBlob).to receive(:call).and_return(blob)
      allow(Autodidact::Analysis::GenerateNoteContent).to receive(:call).and_return(success_result("## Notes\n- point"))

      result = described_class.call(params: {input: file.path}, notify: notify)

      expect(result.error).to be_nil
      expect(result.payload[:note_path]).to end_with(".md")
      expect(result.payload[:source_blob_id]).to eq(42)
      expect(File.exist?(result.payload[:note_path])).to be true
    ensure
      file.close!
    end
  end

  describe "PDF with table of contents" do
    it "returns pending_selection when no chapter is specified" do
      result = described_class.call(
        params: {input: "spec/fixtures/with_toc.pdf"},
        notify: notify
      )

      expect(result).to be_success
      expect(result.payload[:status]).to eq("pending_selection")
      expect(result.payload[:chapters]).not_to be_empty
    end

    it "returns completed when chapter is specified" do
      allow(Autodidact::Storage::PersistSourceBlob).to receive(:call).and_return(blob)
      allow(Autodidact::Analysis::GenerateNoteContent).to receive(:call).and_return(success_result("## Notes"))

      result = described_class.call(
        params: {
          input: "spec/fixtures/with_toc.pdf",
          chapter: {title: "Introduction", page: 1}
        },
        notify: notify
      )

      expect(result).to be_success
      expect(result.payload[:status]).to eq("completed")
      expect(result.payload[:note_path]).to end_with(".md")
      expect(result.payload[:source_blob_id]).to eq(42)
    end
  end

  describe "provider failure" do
    it "returns a failure when analysis raises" do
      file = Tempfile.new(["sample", ".txt"])
      file.write("content")
      file.flush

      allow(Autodidact::Storage::PersistSourceBlob).to receive(:call).and_return(blob)
      allow(Autodidact::Analysis::GenerateNoteContent).to receive(:call)
        .and_return(error_result("Provider analysis failed: rate limited"))

      result = described_class.call(params: {input: file.path}, notify: notify)

      expect(result.payload).to be_nil
      expect(result.error[:message]).to include("rate limited")
    ensure
      file.close!
    end
  end

  describe "missing file" do
    it "returns a failure for nonexistent path" do
      result = described_class.call(params: {input: "/nope/missing.txt"}, notify: notify)

      expect(result.payload).to be_nil
      expect(result.error[:message]).to include("File not found")
    end
  end

  describe "unsupported input types" do
    it "returns a failure for url input" do
      result = described_class.call(params: {input: "https://example.com/article"}, notify: notify)

      expect(result.payload).to be_nil
      expect(result.error[:message]).to include("Input type 'url' is not yet supported")
    end
  end

  describe "raw text success path" do
    it "analyzes raw text end-to-end" do
      allow(Autodidact::Storage::PersistSourceBlob).to receive(:call).and_return(blob)
      allow(Autodidact::Analysis::GenerateNoteContent).to receive(:call).and_return(success_result("## Notes\n- point"))

      result = described_class.call(
        params: {input: "This is a sentence.\nAnd another sentence."},
        notify: notify
      )

      expect(result.error).to be_nil
      expect(result.payload[:note_path]).to end_with(".md")
      expect(result.payload[:source_blob_id]).to eq(42)
      expect(File.exist?(result.payload[:note_path])).to be true
    end
  end

  describe "notify progress" do
    it "emits progress stages in order" do
      file = Tempfile.new(["sample", ".txt"])
      file.write("content")
      file.flush

      allow(Autodidact::Storage::PersistSourceBlob).to receive(:call).and_return(blob)
      allow(Autodidact::Analysis::GenerateNoteContent).to receive(:call).and_return(success_result("notes"))

      stages = []
      tracking_notify = proc { |**data| stages << data[:stage] }

      described_class.call(params: {input: file.path}, notify: tracking_notify)

      expect(stages).to eq(%w[convert persist analyze write])
    ensure
      file.close!
    end
  end
end
