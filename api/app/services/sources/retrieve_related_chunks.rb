# frozen_string_literal: true

module Sources
  # Retrieves related SourceChunks using tag-scoped vector similarity.
  #
  # Retrieval Policy (MVP):
  # - Retrieve up to 20 related chunks
  # - Max 3 chunks per related Source (source diversity)
  # - Uses SourceSelection tags if present, otherwise parent Source tags
  #
  # This policy is isolated in this service and expected to change often.
  # Future improvements: hybrid search, reranking, query expansion.
  class RetrieveRelatedChunks < ApplicationService
    Result = ApplicationResult.define(:chunks, :error_message)

    MAX_TOTAL_CHUNKS = 20
    MAX_CHUNKS_PER_SOURCE = 3

    def initialize(source_selection:, source_chunks:)
      @source_selection = source_selection
      @source_chunks = source_chunks
    end

    def call
      return success(chunks: [], error_message: nil) if source_chunks.empty?

      query_vector = build_query_vector
      return success(chunks: [], error_message: nil) if query_vector.nil?

      candidate_chunks = find_tag_scoped_candidates
      return success(chunks: [], error_message: nil) if candidate_chunks.empty?

      ranked_chunks = rank_and_diversify(query_vector, candidate_chunks)

      success(chunks: ranked_chunks, error_message: nil)
    rescue => e
      failure(chunks: nil, error_message: e.message)
    end

    private

    attr_reader :source_selection, :source_chunks

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

    def find_tag_scoped_candidates
      tag_ids = retrieve_tag_ids
      return SourceChunk.none if tag_ids.empty?

      SourceChunk
        .joins(source_selection_content: {source_selection: :taggings})
        .where.not(source_selection_contents: {source_selection_id: source_selection.id})
        .where(taggings: {tag_id: tag_ids})
        .where.not(embedding: nil)
        .distinct
    end

    def retrieve_tag_ids
      selection_tag_ids = source_selection.tags.pluck(:id)
      return selection_tag_ids if selection_tag_ids.any?

      source_selection.source.tags.pluck(:id)
    end

    def rank_and_diversify(query_vector, candidates)
      scored = candidates.map do |chunk|
        similarity = cosine_similarity(query_vector, chunk.embedding)
        [chunk, similarity]
      end

      scored.sort_by! { |_, similarity| -similarity }

      selected = []
      source_counts = Hash.new(0)

      scored.each do |chunk, similarity|
        source_id = chunk.source_selection_content.source_selection.source_id

        if source_counts[source_id] < MAX_CHUNKS_PER_SOURCE && selected.length < MAX_TOTAL_CHUNKS
          selected << chunk
          source_counts[source_id] += 1
        end

        break if selected.length >= MAX_TOTAL_CHUNKS
      end

      selected
    end

    def cosine_similarity(a, b)
      dot_product = a.zip(b).sum { |x, y| x * y }
      magnitude_a = Math.sqrt(a.sum { |x| x * x })
      magnitude_b = Math.sqrt(b.sum { |x| x * x })

      return 0.0 if magnitude_a.zero? || magnitude_b.zero?

      dot_product / (magnitude_a * magnitude_b)
    end

    def normalize(vector)
      magnitude = Math.sqrt(vector.sum { |v| v * v })
      return vector if magnitude.zero?

      vector.map { |v| v / magnitude }
    end
  end
end
