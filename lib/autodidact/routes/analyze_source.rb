# frozen_string_literal: true

module Autodidact
  module Routes
    class AnalyzeSource < Route
      def call
        Commands::AnalyzeSource.call(
          params: source_params,
          notify: notify
        )
      end

      private

      def source_params
        {
          input: params.fetch(:input),
          tags: params.fetch(:tags, []),
          chapter: params[:chapter]
        }
      end
    end
  end
end
