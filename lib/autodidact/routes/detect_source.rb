# frozen_string_literal: true

module Autodidact
  module Routes
    class DetectSource < Route
      def call
        Commands::DetectSource.call(path: params.fetch(:path))
      end
    end
  end
end
