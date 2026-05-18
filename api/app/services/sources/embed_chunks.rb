# frozen_string_literal: true

module Sources
  class EmbedChunks < ApplicationService
    Result = ApplicationResult.define(:chunks, :error_message, :error_details)

    def initialize(source_chunks:, user: nil, provider: default_provider, client: nil)
      @source_chunks = source_chunks
      @user = user
      @provider = provider
      @client = client
    end

    def call
      success(chunks: embed_chunks, error_message: nil, error_details: {})
    rescue Analysis::ProviderError => e
      ProviderCredentials::RecordProviderError.call(user: user, error: e)
      failure(chunks: nil, error_message: e.message, error_details: e.details)
    rescue => e
      failure(chunks: nil, error_message: e.message, error_details: {})
    end

    private

    attr_reader :source_chunks, :user, :provider, :client

    def embed_chunks
      source_chunks.map do |chunk|
        chunk.update!(embedding: embedding_client.embed(chunk.content))
        chunk
      end
    end

    def embedding_client
      @embedding_client ||= client || client_for_role || client_for(provider)
    end

    def client_for_role
      return if user.blank?

      result = Analysis::ClientForRole.call(user: user, role: :embedding)
      raise result.error_message if result.failure?

      result.client
    end

    def default_provider
      Rails.configuration.x.analysis.embedding_provider || :mock
    end

    def client_for(provider)
      case provider.to_sym
      when :mock
        Analysis::MockEmbeddingClient.new
      when :openai
        raise "OpenAI embedding provider requires user credentials"
      when :google
        raise "Google embedding provider requires user credentials"
      else
        raise "Unknown analysis embedding provider: #{provider.inspect}"
      end
    end
  end
end
