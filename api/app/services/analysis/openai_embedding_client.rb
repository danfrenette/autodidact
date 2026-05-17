# frozen_string_literal: true

module Analysis
  class OpenaiEmbeddingClient
    def initialize(api_key:, model:)
      @api_key = api_key
      @model = model
    end

    def embed(text)
      extract_embeddings(client.embeddings(parameters: {model: model, input: text})).first
    rescue Faraday::Error => e
      raise ProviderError, e.message
    end

    def embed_batch(texts)
      extract_embeddings(client.embeddings(parameters: {model: model, input: texts}))
    rescue Faraday::Error => e
      raise ProviderError, e.message
    end

    private

    attr_reader :api_key, :model

    def client
      @client ||= OpenAI::Client.new(access_token: api_key)
    end

    def extract_embeddings(response)
      data = response["data"]
      raise ProviderError, "Embedding response was empty" if data.blank?

      data.sort_by { |item| item["index"] }.map { |item| item["embedding"] }
    end
  end
end
