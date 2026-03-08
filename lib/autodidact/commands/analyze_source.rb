# frozen_string_literal: true

module Autodidact
  module Commands
    class AnalyzeSource < Command
      class UnsupportedInputType < StandardError; end

      SUPPORTED_INPUT_TYPES = %w[url file_path raw_text].freeze

      def initialize(input:, tags: [], chapter: nil, progress: nil)
        @input = input
        @tags = Array(tags)
        @chapter = chapter
        @progress = progress || proc {}
      end

      def call
        validate_config!

        progress.call(stage: "convert")
        conversion = convert
        return success(payload: conversion.to_wire) unless conversion.continue?

        progress.call(stage: "persist")
        blob = persist(conversion)

        progress.call(stage: "chunk")
        persist_chunks(blob, conversion)

        progress.call(stage: "retrieving")
        related_chunks = retrieve_related_chunks(blob)
        related_chunks = apply_context_budget(conversion, related_chunks)

        progress.call(stage: "analyze")
        content = analyze(conversion, related_chunks)

        progress.call(stage: "write")
        note_path = render_and_write(conversion, content)

        success(payload: completed_payload(note_path, blob))
      end

      private

      attr_reader :input, :tags, :chapter, :progress

      def validate_config!
        raise "Configuration is incomplete. Run setup first." unless Autodidact.config.ready?
      end

      def convert
        case detect_input_type
        when "url" then convert_url
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
        when "text" then convert_text(source)
        when "pdf" then convert_pdf(source)
        end
      end

      def convert_text(source)
        result = Convert::TextConverter.call(path: source[:path], source_type: source[:source_type])
        raise result.error[:message] if result.failure?

        result.payload
      end

      def convert_pdf(source)
        result = Convert::PdfConverter.call(path: source[:path], source_type: source[:source_type], chapter: chapter)
        raise result.error[:message] if result.failure?

        result.payload
      end

      def detect_source
        result = Commands::DetectSource.call(path: input)
        raise result.error[:message] if result.failure?

        result.payload
      end

      def convert_raw_text
        result = Convert::RawTextConverter.call(text: input)
        raise result.error[:message] if result.failure?

        result.payload
      end

      def convert_url
        result = Convert::UrlConverter.call(url: input)
        raise result.error[:message] if result.failure?

        result.payload
      end

      def persist(conversion)
        Storage::PersistSourceBlob.call(
          source_path: conversion.source_path || "raw_text://inline",
          source_type: conversion.source_type,
          selection_kind: conversion.selection_kind,
          raw_text: conversion.raw_text,
          selection_payload: conversion.selection_payload,
          tags: tags
        )
      end

      def persist_chunks(blob, conversion)
        result = Storage::PersistSourceChunks.call(
          source_blob_id: blob.id,
          raw_text: conversion.raw_text
        )
        raise result.error[:message] if result.failure?

        result.payload
      end

      def retrieve_related_chunks(blob)
        result = Retrieval::RelatedChunks.call(
          source_blob_id: blob.id,
          tags: tags
        )
        raise result.error[:message] if result.failure?

        result.payload
      end

      def apply_context_budget(conversion, related_chunks)
        source_tokens = count_source_tokens(conversion.raw_text)
        result = Analysis::ContextBudget.call(
          provider: Autodidact.config.provider,
          model: Autodidact.config.model,
          source_text_tokens: source_tokens,
          related_chunks: related_chunks
        )
        raise result.error[:message] if result.failure?

        result.payload
      end

      def count_source_tokens(raw_text)
        result = Analysis::TokenCounter.call(text: raw_text)
        raise result.error[:message] if result.failure?

        result.payload
      end

      def analyze(conversion, related_chunks)
        result = Analysis::GenerateNoteContent.call(
          raw_text: conversion.raw_text,
          related_chunks: related_chunks
        )
        raise result.error[:message] if result.failure?

        result.payload
      end

      def render_and_write(conversion, content)
        rendered = Output::RenderNote.call(
          tags: tags,
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
