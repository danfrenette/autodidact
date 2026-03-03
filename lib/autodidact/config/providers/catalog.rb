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
          :model_options_loader
        ) do
          def model_options
            model_options_loader.call
          end
        end

        def self.all
          @all ||= [
            ProviderDefinition.new(
              id: "openai",
              label: "OpenAI",
              setup_visible: true,
              runtime_client_class: Provider::OpenaiClient,
              model_options_loader: -> { ModelOptions.call(provider_id: :openai) }
            ),
            ProviderDefinition.new(
              id: "anthropic",
              label: "Anthropic",
              setup_visible: true,
              runtime_client_class: Provider::AnthropicClient,
              model_options_loader: -> { ModelOptions.call(provider_id: :anthropic) }
            ),
            ProviderDefinition.new(
              id: "google",
              label: "Google",
              setup_visible: true,
              runtime_client_class: Provider::GoogleClient,
              model_options_loader: -> { ModelOptions.call(provider_id: :google) }
            ),
            ProviderDefinition.new(
              id: "dev",
              label: "Dev",
              setup_visible: false,
              runtime_client_class: Provider::DevClient,
              model_options_loader: -> { [] }
            )
          ].freeze
        end

        def self.fetch(provider_id)
          all.find { |provider| provider.id == provider_id }
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
