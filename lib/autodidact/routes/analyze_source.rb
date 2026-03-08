# frozen_string_literal: true

module Autodidact
  module Routes
    class AnalyzeSource < Route
      def call
        Commands::AnalyzeSource.call(
          input: params.fetch(:input),
          tags: params.fetch(:tags, []),
          chapter: params[:chapter],
          progress: method(:emit_progress)
        )
      end

      private

      def emit_progress(stage:)
        notify.call(stage: stage)
      end
    end
  end
end
