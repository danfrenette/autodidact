# frozen_string_literal: true

module Autodidact
  module Commands
    class DetectInputTypeRoute < Query
      def initialize(params:, **)
        @input = params.fetch(:input)
      end

      def call
        DetectInputType.call(input: input)
      end

      private

      attr_reader :input
    end
  end
end
