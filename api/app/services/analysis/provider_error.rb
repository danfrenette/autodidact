# frozen_string_literal: true

module Analysis
  class ProviderError < StandardError
    attr_reader :code, :provider, :retry_after, :raw_message

    def initialize(message, code: :provider_error, provider: nil, retry_after: nil, raw_message: nil)
      @code = code.to_s
      @provider = provider&.to_s
      @retry_after = retry_after
      @raw_message = raw_message || message

      super(message)
    end

    def details
      {
        code: code,
        provider: provider,
        retry_after: retry_after,
        raw_message: raw_message
      }.compact
    end

    def credential_blocking?
      %w[quota_exceeded rate_limit_exceeded invalid_api_key].include?(code)
    end
  end
end
