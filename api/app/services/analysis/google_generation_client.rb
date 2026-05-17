# frozen_string_literal: true

module Analysis
  class GoogleGenerationClient
    def initialize(api_key:, model:)
      @api_key = api_key
      @model = model
    end

    def analyze(source_chunks:, related_chunks: [])
      prompt = Analysis::SourceSelectionPrompt.new(source_chunks: source_chunks, related_chunks: related_chunks).to_s
      content = generate(prompt)

      JSON.parse(json_content(content), symbolize_names: true)
    rescue JSON::ParserError => e
      raise ProviderError, "Provider returned invalid JSON: #{e.message}"
    end

    private

    attr_reader :api_key, :model

    def generate(prompt)
      content = post("#{model_path}:generateContent", generate_body(prompt)).dig("candidates", 0, "content", "parts", 0, "text")
      raise ProviderError, "Provider returned empty content" if content.blank?

      content
    rescue Faraday::Error => e
      raise ProviderError, e.message
    end

    def generate_body(prompt)
      {
        contents: [{role: "user", parts: [{text: prompt}]}],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      }
    end

    def post(path, body)
      response = connection.post(path) do |request|
        request.params["key"] = api_key
        request.headers["Content-Type"] = "application/json"
        request.body = JSON.generate(body)
      end

      raise ProviderError, google_error_message(response) unless response.success?

      response_body(response)
    end

    def google_error_message(response)
      body = response_body(response)
      body.dig("error", "message") || "Google API returned HTTP #{response.status}"
    end

    def response_body(response)
      body = response.body
      return body if body.is_a?(Hash)

      JSON.parse(body.to_s)
    end

    def json_content(content)
      content.to_s.strip.sub(/\A```(?:json)?\s*/i, "").sub(/\s*```\z/, "")
    end

    def model_path
      @model_path ||= "models/#{model}"
    end

    def connection
      @connection ||= Faraday.new(url: "https://generativelanguage.googleapis.com/v1beta/")
    end
  end
end
