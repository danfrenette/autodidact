# frozen_string_literal: true

module Autodidact
  module Analysis
    class ContextBudget < Query
      RESPONSE_RESERVE = 4096
      PROMPT_OVERHEAD = 1800

      def initialize(provider:, model:, source_text_tokens:, related_chunks:)
        @provider = provider
        @model = model
        @source_text_tokens = source_text_tokens
        @related_chunks = Array(related_chunks)
      end

      def call
        budget = context_limit - RESPONSE_RESERVE - PROMPT_OVERHEAD - source_text_tokens
        success(payload: fill(budget))
      end

      private

      attr_reader :provider, :model, :source_text_tokens, :related_chunks

      def fill(budget)
        remaining = budget
        related_chunks.take_while do |chunk|
          remaining -= chunk.token_count
          remaining >= 0
        end
      end

      def context_limit
        Config::Providers::Catalog.context_limit_for(provider_id: provider, model: model)
      end
    end
  end
end
