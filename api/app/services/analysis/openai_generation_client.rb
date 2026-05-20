# frozen_string_literal: true

module Analysis
  class OpenaiGenerationClient
    def initialize(api_key:, model:)
      @api_key = api_key
      @model = model
    end

    def analyze(source_chunks:, related_chunks: [])
      prompt = Analysis::SourceSelectionPrompt.new(source_chunks: source_chunks, related_chunks: related_chunks)
      content = chat(prompt.to_s)

      prompt.resolve_citations(JSON.parse(json_content(content), symbolize_names: true))
    rescue JSON::ParserError => e
      raise ProviderError, "Provider returned invalid JSON: #{e.message}"
    end

    private

    attr_reader :api_key, :model

    def chat(prompt)
      response = client.chat(parameters: {model: model, messages: [{role: "user", content: prompt}], temperature: 0.2})
      content = response.dig("choices", 0, "message", "content")
      raise ProviderError, "Provider returned empty content" if content.blank?

      content
    rescue Faraday::Error => e
      raise ProviderError, e.message
    end

    def json_content(content)
      content.to_s.strip.sub(/\A```(?:json)?\s*/i, "").sub(/\s*```\z/, "")
    end

    def client
      @client ||= OpenAI::Client.new(access_token: api_key)
    end
  end
end
