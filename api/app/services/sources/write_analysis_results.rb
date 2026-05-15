# frozen_string_literal: true

module Sources
  class WriteAnalysisResults < ApplicationService
    Result = ApplicationResult.define(:error_message)

    def initialize(source_selection:, analysis:, source_chunks:)
      @source_selection = source_selection
      @analysis = analysis
      @source_chunks = source_chunks
    end

    def call
      ActiveRecord::Base.transaction do
        replace_existing_results
        write_concepts
        write_questions
        write_quotes
      end

      success(error_message: nil)
    rescue => e
      failure(error_message: e.message)
    end

    private

    attr_reader :source_selection, :analysis, :source_chunks

    def replace_existing_results
      source_selection.concepts.destroy_all
      source_selection.questions.destroy_all
      source_selection.quotes.destroy_all
    end

    def write_concepts
      concepts.each do |attributes|
        concept = source_selection.concepts.create!(
          name: attributes.fetch(:name),
          definition: attributes[:definition],
          why_it_matters: attributes[:why_it_matters],
          classification: attributes.fetch(:classification, "supporting")
        )

        cite(concept, attributes[:cited_chunk_ids], :supporting)
      end
    end

    def write_questions
      questions.each_with_index do |attributes, index|
        question = source_selection.questions.create!(
          tier: attributes.fetch(:tier, 1),
          tier_name: attributes.fetch(:tier_name, "Recall"),
          text: attributes.fetch(:text),
          answer: attributes.fetch(:answer),
          position: index
        )

        cite(question, attributes[:cited_chunk_ids], :answer_source)
      end
    end

    def write_quotes
      quotes.each_with_index do |attributes, index|
        quote = source_selection.quotes.create!(
          text: attributes.fetch(:text),
          note: attributes[:note],
          position: index
        )

        cite(quote, attributes[:cited_chunk_ids], :quote_source)
      end
    end

    def cite(record, chunk_ids, role)
      Array(chunk_ids).each_with_index do |chunk_id, index|
        chunk = chunks_by_id.fetch(chunk_id)

        record.citations.create!(
          source_chunk: chunk,
          role: role,
          position: index
        )
      end
    end

    def chunks_by_id
      @chunks_by_id ||= source_chunks.index_by(&:chunk_id)
    end

    def concepts
      Array(analysis[:concepts])
    end

    def questions
      Array(analysis[:questions])
    end

    def quotes
      Array(analysis[:quotes])
    end
  end
end
