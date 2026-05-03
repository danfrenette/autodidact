# frozen_string_literal: true

require "base64"
require "openssl"

module Auth
  class CurrentUserResolver
    COOKIE_NAMES = [
      "__Secure-better-auth.session_token",
      "better-auth.session_token",
      "better-auth-session_token"
    ].freeze

    def initialize(cookies:, secret: ENV["BETTER_AUTH_SECRET"])
      @cookies = cookies
      @secret = secret
    end

    def call
      return if secret.blank?

      token = verified_session_token
      return if token.blank?

      Auth::Session.includes(:user).find_by(token: token)&.user
    end

    private

    attr_reader :cookies, :secret

    def verified_session_token
      COOKIE_NAMES.each do |cookie_name|
        value = cookies[cookie_name]
        token = verify_cookie_value(value)
        return token if token.present?
      end

      nil
    end

    def verify_cookie_value(value)
      return nil if value.blank?

      token, signature = value.rpartition(".").values_at(0, 2)
      return nil if token.blank? || signature.blank?

      expected_signature = Base64.strict_encode64(OpenSSL::HMAC.digest("SHA256", secret, token))
      return nil unless ActiveSupport::SecurityUtils.secure_compare(signature, expected_signature)

      token
    rescue ArgumentError
      nil
    end
  end
end
