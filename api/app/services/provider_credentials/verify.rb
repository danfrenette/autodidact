# frozen_string_literal: true

module ProviderCredentials
  class Verify < ApplicationService
    Result = ApplicationResult.define(:error_message)

    def initialize(provider:, api_key:)
      @provider = provider
      @api_key = api_key
    end

    def call
      verify_provider
      success(error_message: nil)
    rescue => e
      failure(error_message: e.message)
    end

    private

    attr_reader :provider, :api_key

    def verify_provider
      case provider.to_s
      when "openai"
        Analysis::OpenaiEmbeddingClient.new(api_key: api_key, model: "text-embedding-3-small").embed("verify")
      else
        raise "Unknown provider: #{provider.inspect}"
      end
    end
  end
end
