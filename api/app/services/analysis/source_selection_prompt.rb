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
        Concept classification must be exactly one of: core, supporting, advanced.
        Each question must include: tier, tier_name, text, answer, cited_chunk_ids.
        Each quote must include: text, note, cited_chunk_ids.
        Use only the chunk labels shown below in cited_chunk_ids, such as "C1" or "R1".
        Do not invent, shorten, or modify citation labels.

        Current source chunks:
        #{format_chunks(source_chunks, prefix: "C")}

        Related source chunks:
        #{format_chunks(related_chunks, prefix: "R")}
      PROMPT
    end

    def resolve_citations(analysis)
      %i[concepts questions quotes].each do |section|
        Array(analysis[section]).each do |attributes|
          attributes[:cited_chunk_ids] = Array(attributes[:cited_chunk_ids]).map { |label| chunk_id_for(label) }
        end
      end

      analysis
    end

    private

    attr_reader :source_chunks, :related_chunks

    def citation_map
      @citation_map ||= labeled_chunks.to_h
    end

    def labeled_chunks
      current_labels = Array(source_chunks).each_with_index.map { |chunk, index| ["C#{index + 1}", chunk] }
      related_labels = Array(related_chunks).each_with_index.map { |chunk, index| ["R#{index + 1}", chunk] }

      current_labels + related_labels
    end

    def format_chunks(chunks, prefix:)
      Array(chunks).each_with_index.map do |chunk, index|
        "- #{prefix}#{index + 1}: #{chunk.content.to_s.squish}"
      end.join("\n")
    end

    def chunk_id_for(label)
      citation_map.fetch(label.to_s).chunk_id
    rescue KeyError
      raise ProviderError.new(
        "Provider returned invalid citation label: #{label.inspect}",
        code: :invalid_citation_label
      )
    end
  end
end
