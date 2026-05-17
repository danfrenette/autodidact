# frozen_string_literal: true

module Analysis
  class ProviderRegistry
    def self.all
      definitions = [Providers::Openai.definition]
      definitions << Providers::Mock.definition if mock_enabled?
      definitions
    end

    def self.find(provider_id)
      all.find { |provider| provider.id == provider_id.to_s }
    end

    def self.fetch(provider_id)
      find(provider_id) || raise("Unknown analysis provider: #{provider_id.inspect}")
    end

    def self.for_role(role)
      all.select { |provider| provider.supports?(role) }
    end

    def self.mock_enabled?
      !Rails.env.production? || Rails.configuration.x.analysis.mock_provider_enabled
    end
  end
end
