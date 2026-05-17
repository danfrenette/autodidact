# frozen_string_literal: true

module Sources
  class AnalyzeContent < ApplicationService
    Result = ApplicationResult.define(:analysis, :error_message)

    def initialize(source_chunks:, related_chunks:, user: nil, provider: default_provider, client: nil)
      @source_chunks = source_chunks
      @related_chunks = related_chunks
      @user = user
      @provider = provider
      @client = client
    end

    def call
      success(analysis: generation_client.analyze(source_chunks: source_chunks, related_chunks: related_chunks), error_message: nil)
    rescue => e
      failure(analysis: nil, error_message: e.message)
    end

    private

    attr_reader :source_chunks, :related_chunks, :user, :provider, :client

    def generation_client
      @generation_client ||= client || client_for_role || client_for(provider)
    end

    def client_for_role
      return if user.blank?

      result = Analysis::ClientForRole.call(user: user, role: :generation)
      raise result.error_message if result.failure?

      result.client
    end

    def default_provider
      Rails.configuration.x.analysis.generation_provider || :mock
    end

    def client_for(provider)
      case provider.to_sym
      when :mock
        Analysis::MockGenerationClient.new
      when :openai
        raise "OpenAI generation provider requires user credentials"
      when :google
        raise "Google generation provider requires user credentials"
      else
        raise "Unknown analysis generation provider: #{provider.inspect}"
      end
    end
  end
end
