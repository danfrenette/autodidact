# frozen_string_literal: true

module Analysis
  module Providers
    module Openai
      def self.definition
        ProviderDefinition.new(
          id: "openai",
          display_name: "OpenAI",
          supported_roles: %i[embedding generation],
          models_by_role: {
            embedding: ["text-embedding-3-small"],
            generation: ["gpt-4o-mini"]
          },
          default_models_by_role: {
            embedding: "text-embedding-3-small",
            generation: "gpt-4o-mini"
          },
          requires_credentials: true
        )
      end
    end
  end
end
