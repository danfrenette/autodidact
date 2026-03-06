# frozen_string_literal: true

module Autodidact
  module Config
    module Providers
      class Catalog
        ProviderDefinition = Data.define(
          :id,
          :label,
          :setup_visible,
          :runtime_client_class,
          :model_options_loader,
          :context_limits
        ) do
          def model_options
            model_options_loader.call
          end

          def context_limit_for(model)
            context_limits.each do |prefix, limit|
              return limit if model.start_with?(prefix)
            end
            DEFAULT_CONTEXT_LIMIT
          end
        end

        DEFAULT_CONTEXT_LIMIT = 128_000

        def self.all
          @all ||= [
            ProviderDefinition.new(
              id: "openai",
              label: "OpenAI",
              setup_visible: true,
              runtime_client_class: Provider::OpenaiClient,
              model_options_loader: -> { ModelOptions.call(provider_id: :openai) },
              context_limits: {"gpt-4o" => 128_000, "gpt-4" => 128_000, "gpt-3.5" => 16_385}
            ),
            ProviderDefinition.new(
              id: "anthropic",
              label: "Anthropic",
              setup_visible: true,
              runtime_client_class: Provider::AnthropicClient,
              model_options_loader: -> { ModelOptions.call(provider_id: :anthropic) },
              context_limits: {"claude" => 200_000}
            ),
            ProviderDefinition.new(
              id: "google",
              label: "Google",
              setup_visible: true,
              runtime_client_class: Provider::GoogleClient,
              model_options_loader: -> { ModelOptions.call(provider_id: :google) },
              context_limits: {"gemini" => 1_048_576}
            ),
            ProviderDefinition.new(
              id: "dev",
              label: "Dev",
              setup_visible: false,
              runtime_client_class: Provider::DevClient,
              model_options_loader: -> { [] },
              context_limits: {}
            )
          ].freeze
        end

        def self.fetch(provider_id)
          all.find { |provider| provider.id == provider_id }
        end

        def self.context_limit_for(provider_id:, model:)
          definition = fetch(provider_id)
          return DEFAULT_CONTEXT_LIMIT if definition.nil?

          definition.context_limit_for(model)
        end

        def self.setup_visible
          all.select(&:setup_visible)
        end

        def self.setup_visible_ids
          setup_visible.map(&:id)
        end
      end
    end
  end
end
