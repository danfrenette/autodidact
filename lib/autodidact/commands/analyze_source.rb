# frozen_string_literal: true

module Autodidact
  module Commands
    class AnalyzeSource < Command
      class PdfNotImplemented < StandardError; end
      class UnsupportedInputKind < StandardError; end

      def call(params:, notify:)
        raise "Configuration is incomplete. Run setup first." unless Autodidact.config.ready?

        source = detect_source(params, notify)
        raise PdfNotImplemented, "PDF sources are not yet implemented" if source[:source_type] == "pdf"

        raw_text = ingest_text(source, notify)
        blob = persist_source_blob(source, raw_text, notify)
        content = analyze_content(raw_text, notify)
        note_path = render_and_write_note(source, content, notify)

        success(payload: {note_path: note_path.to_s, source_blob_id: blob.id})
      end

      private

      def detect_source(params, notify)
        notify.call(stage: "detect_source")

        input_kind_result = Commands::DetectInputKind.call(params: params, notify: notify)
        raise StandardError, input_kind_result.error[:message] if input_kind_result.failure?

        input_kind = input_kind_result.payload[:input_kind]
        raise UnsupportedInputKind, unsupported_input_message(input_kind) unless input_kind == "file_path"

        result = Commands::DetectSource.call(params: params, notify: notify)
        raise StandardError, result.error[:message] if result.failure?

        result.payload
      end

      def unsupported_input_message(input_kind)
        "Input kind '#{input_kind}' is detected but not supported yet. Please provide a local file path."
      end

      def ingest_text(source, notify)
        notify.call(stage: "ingest")
        Ingest::TextIngestor.call(path: source[:path])
      end

      def persist_source_blob(source, raw_text, notify)
        notify.call(stage: "persist")
        Storage::PersistSourceBlob.call(
          source_path: source[:path],
          source_type: source[:source_type],
          selection_kind: "full",
          raw_text: raw_text
        )
      end

      def analyze_content(raw_text, notify)
        notify.call(stage: "analyze")
        Analysis::GenerateNoteContent.call(raw_text: raw_text)
      end

      def render_and_write_note(source, content, notify)
        notify.call(stage: "write")
        rendered = Output::RenderNote.call(
          tag: "autodidact",
          source_path: source[:path],
          content: content,
          created_at: Time.now
        )

        Output::WriteNote.call(
          vault_path: Autodidact.config.obsidian_vault_path,
          filename: note_filename(source),
          rendered_content: rendered
        )
      end

      def note_filename(source)
        timestamp = Time.now.strftime("%Y-%m-%d")
        basename = File.basename(source[:path], ".*").gsub(/[^a-zA-Z0-9\-_]+/, "-")
        "#{timestamp}--#{basename}.md"
      end
    end
  end
end
