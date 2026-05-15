# frozen_string_literal: true

require "digest"

module Analysis
  class MockEmbeddingClient
    DIMENSION = 1536

    def embed(text)
      bytes = Digest::SHA256.digest(text.to_s).bytes
      vector = Array.new(DIMENSION) do |index|
        ((bytes[index % bytes.length] / 255.0) * 2.0) - 1.0
      end

      normalize(vector)
    end

    private

    def normalize(vector)
      magnitude = Math.sqrt(vector.sum { |value| value * value })
      return vector if magnitude.zero?

      vector.map { |value| value / magnitude }
    end
  end
end
