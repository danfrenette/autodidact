# frozen_string_literal: true

module Analysis
  class GoogleEmbeddingClient
    OUTPUT_DIMENSIONALITY = 1536

    def initialize(api_key:, model:)
      @api_key = api_key
      @model = model
    end

    def embed(text)
      values = post("#{model_path}:embedContent", embed_body(text)).dig("embedding", "values")
      raise Providers::Google::Error.invalid_response("Embedding response was empty") if values.blank?

      values
    rescue Faraday::Error => e
      raise Providers::Google::Error.unavailable(e.message)
    end

    def embed_batch(texts)
      texts.map { |text| embed(text) }
    end

    private

    attr_reader :api_key, :model

    def embed_body(text)
      {
        model: model_path,
        content: {parts: [{text: text}]},
        outputDimensionality: OUTPUT_DIMENSIONALITY
      }
    end

    def post(path, body)
      response = connection.post(path) do |request|
        request.params["key"] = api_key
        request.headers["Content-Type"] = "application/json"
        request.body = JSON.generate(body)
      end

      raise google_error(response) unless response.success?

      response_body(response)
    end

    def google_error(response)
      Providers::Google::Error.from_response(status: response.status, body: response_body(response))
    end

    def response_body(response)
      body = response.body
      return body if body.is_a?(Hash)

      JSON.parse(body.to_s)
    end

    def model_path
      @model_path ||= "models/#{model}"
    end

    def connection
      @connection ||= Faraday.new(url: "https://generativelanguage.googleapis.com/v1beta/")
    end
  end
end
