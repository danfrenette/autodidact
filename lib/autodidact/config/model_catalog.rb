# frozen_string_literal: true

module Autodidact
  module Config
    class ModelCatalog < Query
      def call
        success(payload: {
          chat_provider_options: chat_provider_options,
          chat_provider_model_options: chat_provider_model_options,
          embedding_provider_options: embedding_provider_options,
          embedding_provider_model_options: embedding_provider_model_options
        })
      end

      private

      def chat_provider_options
        ChatModelOptions::PROVIDER_FAMILIES.keys
      end

      def embedding_provider_options
        EmbeddingModelOptions::PROVIDER_FAMILIES.keys
      end

      def chat_provider_model_options
        chat_provider_options.each_with_object({}) do |provider_id, options|
          options[provider_id] = query_chat_models(provider_id)
        end
      end

      def embedding_provider_model_options
        embedding_provider_options.each_with_object({}) do |provider_id, options|
          options[provider_id] = query_embedding_models(provider_id)
        end
      end

      def query_chat_models(provider_id)
        result = ChatModelOptions.call(provider_id: provider_id)
        raise result.error[:message] if result.failure?

        result.payload
      end

      def query_embedding_models(provider_id)
        result = EmbeddingModelOptions.call(provider_id: provider_id)
        raise result.error[:message] if result.failure?

        result.payload
      end
    end
  end
end
