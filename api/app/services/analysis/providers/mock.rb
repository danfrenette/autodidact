# frozen_string_literal: true

module Analysis
  module Providers
    module Mock
      def self.definition
        ProviderDefinition.new(
          id: "mock",
          display_name: "Mock (development)",
          supported_roles: %i[embedding generation],
          models_by_role: {
            embedding: ["mock-model"],
            generation: ["mock-model"]
          },
          default_models_by_role: {
            embedding: "mock-model",
            generation: "mock-model"
          },
          requires_credentials: false
        )
      end
    end
  end
end
