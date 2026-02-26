# frozen_string_literal: true

module Autodidact
  module Commands
    class DetectInputKind < Command
      URL_PATTERN = %r{\Ahttps?://\S+\z}

      def call(params:, notify:)
        input = extract_input(params)

        success(payload: {
          input_kind: classify(input)
        })
      end

      private

      def extract_input(params)
        params[:input] || params[:path] || ""
      end

      def classify(input)
        value = input.to_s.strip
        return "url" if url?(value)
        return "file_path" if file_path?(value)
        return "raw_text" if prose_like?(value)

        "file_path"
      end

      def url?(value)
        value.match?(URL_PATTERN)
      end

      def file_path?(value)
        return false if value.empty?

        File.file?(File.expand_path(value))
      end

      def prose_like?(value)
        return false if value.empty?
        return true if value.include?("\n")

        looks_like_sentence = value.match?(/[[:alpha:]].*\s+.*[[:alpha:]]/)
        looks_like_path = value.include?("/") || value.include?("\\") || value.match?(%r{\A\.?\.?/?\w+})
        looks_like_sentence && !looks_like_path
      end
    end
  end
end
