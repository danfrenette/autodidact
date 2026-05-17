# frozen_string_literal: true

module Analysis
  module Providers
    module Google
      def self.definition
        ProviderDefinition.new(
          id: "google",
          display_name: "Google AI Studio",
          supported_roles: %i[embedding generation],
          models_by_role: {
            embedding: ["gemini-embedding-001"],
            generation: ["gemini-2.0-flash-lite"]
          },
          default_models_by_role: {
            embedding: "gemini-embedding-001",
            generation: "gemini-2.0-flash-lite"
          },
          requires_credentials: true
        )
      end
    end
  end
end
