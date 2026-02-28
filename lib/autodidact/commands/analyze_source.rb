# frozen_string_literal: true

module Autodidact
  module Commands
    class AnalyzeSource < Command
      class UnsupportedInputType < StandardError; end
      class UnsupportedSourceType < StandardError; end

      SUPPORTED_INPUT_TYPES = %w[file_path raw_text].freeze

      def initialize(params:, notify:)
        @input = params.fetch(:input)
        @chapter = params[:chapter]
        @notify = notify
      end

      def call
        validate_config!

        notify.call(stage: "convert")
        conversion = convert
        return success(payload: conversion.to_wire) unless conversion.continue?

        notify.call(stage: "persist")
        blob = persist(conversion)

        notify.call(stage: "analyze")
        content = analyze(conversion)

        notify.call(stage: "write")
        note_path = render_and_write(conversion, content)

        success(payload: completed_payload(note_path, blob))
      end

      private

      attr_reader :input, :chapter, :notify

      def validate_config!
        raise "Configuration is incomplete. Run setup first." unless Autodidact.config.ready?
      end

      def convert
        input_type = detect_input_type

        case input_type
        when "file_path" then convert_file
        when "raw_text" then convert_raw_text
        end
      end

      def detect_input_type
        result = Commands::DetectInputType.call(input: input)
        input_type = result.payload[:input_type]

        unless SUPPORTED_INPUT_TYPES.include?(input_type)
          raise UnsupportedInputType,
            "Input type '#{input_type}' is not yet supported. Please provide a local file path or raw text."
        end

        input_type
      end

      def convert_file
        source = detect_source

        case source[:source_type]
        when "text"
          convert_text(source)
        when "pdf"
          convert_pdf(source)
        end
      end

      def convert_text(source)
        result = Convert::TextConverter.call(path: source[:path], source_type: source[:source_type])
        raise StandardError, result.error[:message] if result.failure?

        result.payload
      end

      def convert_pdf(source)
        result = Convert::PdfConverter.call(path: source[:path], source_type: source[:source_type], chapter: chapter)
        raise StandardError, result.error[:message] if result.failure?

        result.payload
      end

      def detect_source
        result = Commands::DetectSource.call(params: {path: input}, notify: notify)
        raise StandardError, result.error[:message] if result.failure?

        result.payload
      end

      def convert_raw_text
        timestamp = Time.now.strftime("%Y-%m-%d")

        ConversionResult.new(
          raw_text: input,
          source_path: nil,
          source_type: "text",
          selection_kind: "full",
          selection_payload: {input_type: "raw_text"},
          note_filename: "#{timestamp}--raw-text.md"
        )
      end

      def persist(conversion)
        Storage::PersistSourceBlob.call(
          source_path: conversion.source_path || "raw_text://inline",
          source_type: conversion.source_type,
          selection_kind: conversion.selection_kind,
          raw_text: conversion.raw_text,
          selection_payload: conversion.selection_payload
        )
      end

      def analyze(conversion)
        Analysis::GenerateNoteContent.call(raw_text: conversion.raw_text)
      end

      def render_and_write(conversion, content)
        rendered = Output::RenderNote.call(
          tag: "autodidact",
          source_path: conversion.source_path || "raw_text://inline",
          content: content,
          created_at: Time.now
        )

        Output::WriteNote.call(
          vault_path: Autodidact.config.obsidian_vault_path,
          filename: conversion.note_filename,
          rendered_content: rendered
        )
      end

      def completed_payload(note_path, blob)
        Commands::Payloads::CompletedAnalysis.new(
          note_path: note_path.to_s,
          source_blob_id: blob.id
        ).to_wire
      end
    end
  end
end
