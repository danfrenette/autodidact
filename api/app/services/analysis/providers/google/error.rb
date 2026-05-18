# frozen_string_literal: true

module Analysis
  module Providers
    module Google
      class Error
        def self.from_response(status:, body:)
          new(status: status, body: body).to_provider_error
        end

        def self.invalid_response(message)
          ProviderError.new(message, code: :invalid_response, provider: :google)
        end

        def self.unavailable(message)
          ProviderError.new(message, code: :provider_unavailable, provider: :google)
        end

        def initialize(status:, body:)
          @status = status
          @body = body
        end

        def to_provider_error
          ProviderError.new(
            message,
            code: code,
            provider: :google,
            retry_after: retry_after,
            raw_message: raw_message
          )
        end

        private

        attr_reader :status, :body

        def message
          case code
          when :quota_exceeded
            "Google quota exceeded. Check billing, wait for quota to reset, or choose another generation provider."
          when :rate_limit_exceeded
            "Google rate limit exceeded. Wait before retrying or choose another provider."
          when :invalid_api_key
            "Google credential is no longer valid. Update your API key or choose another provider."
          else
            raw_message
          end
        end

        def code
          return :quota_exceeded if resource_exhausted? && raw_message.match?(/quota/i)
          return :rate_limit_exceeded if resource_exhausted? || status == 429
          return :invalid_api_key if %w[UNAUTHENTICATED PERMISSION_DENIED].include?(google_status) || [401, 403].include?(status)

          :provider_error
        end

        def retry_after
          match = raw_message.match(/retry in ([\d.]+)s/i)
          match[1].to_f if match
        end

        def resource_exhausted?
          google_status == "RESOURCE_EXHAUSTED"
        end

        def google_status
          body.dig("error", "status")
        end

        def raw_message
          @raw_message ||= body.dig("error", "message") || "Google API returned HTTP #{status}"
        end
      end
    end
  end
end
