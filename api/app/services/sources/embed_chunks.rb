# frozen_string_literal: true

module Sources
  class EmbedChunks < ApplicationService
    Result = ApplicationResult.define(:chunks, :error_message)

    def initialize(source_chunks:, provider: default_provider, client: nil)
      @source_chunks = source_chunks
      @provider = provider
      @client = client
    end

    def call
      success(chunks: embed_chunks, error_message: nil)
    rescue => e
      failure(chunks: nil, error_message: e.message)
    end

    private

    attr_reader :source_chunks, :provider, :client

    def embed_chunks
      source_chunks.map do |chunk|
        chunk.update!(embedding: embedding_client.embed(chunk.content))
        chunk
      end
    end

    def embedding_client
      @embedding_client ||= client || client_for(provider)
    end

    def default_provider
      Rails.configuration.x.analysis.embedding_provider || :mock
    end

    def client_for(provider)
      case provider.to_sym
      when :mock
        Analysis::MockEmbeddingClient.new
      else
        raise "Unknown analysis embedding provider: #{provider.inspect}"
      end
    end
  end
end
