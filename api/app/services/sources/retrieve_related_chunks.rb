# frozen_string_literal: true

module Sources
  class RetrieveRelatedChunks < ApplicationService
    Result = ApplicationResult.define(:chunks, :error_message)

    MAX_TOTAL_CHUNKS = 20
    MAX_CHUNKS_PER_SOURCE = 3

    def initialize(source_selection:, source_chunks:)
      @source_selection = source_selection
      @source_chunks = source_chunks
    end

    def call
      success(chunks: related_chunks, error_message: nil)
    rescue => e
      failure(chunks: nil, error_message: e.message)
    end

    private

    attr_reader :source_selection, :source_chunks

    def related_chunks
      return [] if source_chunks.empty?
      return [] if query_vector.nil?
      return [] if tag_ids.empty?

      diversify(ranked_candidates)
    end

    def ranked_candidates
      candidate_scope
        .nearest_neighbors(:embedding, query_vector, distance: :cosine)
        .limit(MAX_TOTAL_CHUNKS * MAX_CHUNKS_PER_SOURCE)
        .includes(source_selection_content: :source_selection)
    end

    def candidate_scope
      SourceChunk
        .joins(source_selection_content: {source_selection: :taggings})
        .where.not(source_selection_contents: {source_selection_id: source_selection.id})
        .where(taggings: {tag_id: tag_ids})
        .distinct
    end

    def tag_ids
      @tag_ids ||= begin
        selection_tag_ids = source_selection.tags.pluck(:id)
        selection_tag_ids.presence || source_selection.source.tags.pluck(:id)
      end
    end

    def query_vector
      @query_vector ||= build_query_vector
    end

    def build_query_vector
      embeddings = source_chunks.map(&:embedding).compact
      return nil if embeddings.empty?

      dimension = embeddings.first.length
      sum_vector = Array.new(dimension, 0.0)

      embeddings.each do |emb|
        emb.each_with_index do |val, idx|
          sum_vector[idx] += val
        end
      end

      count = embeddings.length
      avg_vector = sum_vector.map { |v| v / count }
      normalize(avg_vector)
    end

    def diversify(chunks)
      selected = []
      source_counts = Hash.new(0)

      chunks.each do |chunk|
        source_id = chunk.source_selection_content.source_selection.source_id

        if source_counts[source_id] < MAX_CHUNKS_PER_SOURCE && selected.length < MAX_TOTAL_CHUNKS
          selected << chunk
          source_counts[source_id] += 1
        end

        break if selected.length >= MAX_TOTAL_CHUNKS
      end

      selected
    end

    def normalize(vector)
      magnitude = Math.sqrt(vector.sum { |v| v * v })
      return vector if magnitude.zero?

      vector.map { |v| v / magnitude }
    end
  end
end
