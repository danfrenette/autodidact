# frozen_string_literal: true

module Analysis
  class SourceSelectionPrompt
    def initialize(source_chunks:, related_chunks: [])
      @source_chunks = source_chunks
      @related_chunks = related_chunks
    end

    def to_s
      <<~PROMPT
        You are generating structured study material for Autodidact.

        Return only valid JSON with these top-level keys: concepts, questions, quotes.
        Each concept must include: name, definition, classification, why_it_matters, cited_chunk_ids.
        Each question must include: tier, tier_name, text, answer, cited_chunk_ids.
        Each quote must include: text, note, cited_chunk_ids.

        Current source chunks:
        #{format_chunks(source_chunks)}

        Related source chunks:
        #{format_chunks(related_chunks)}
      PROMPT
    end

    private

    attr_reader :source_chunks, :related_chunks

    def format_chunks(chunks)
      Array(chunks).map do |chunk|
        "- #{chunk.chunk_id}: #{chunk.content.to_s.squish}"
      end.join("\n")
    end
  end
end
