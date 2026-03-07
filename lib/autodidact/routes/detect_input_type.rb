# frozen_string_literal: true

module Autodidact
  module Routes
    class DetectInputType < Route
      def call
        Commands::DetectInputType.call(input: params.fetch(:input))
      end
    end
  end
end
