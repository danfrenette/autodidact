# frozen_string_literal: true

module ProviderCredentials
  class Upsert < ApplicationService
    Result = ApplicationResult.define(:credential, :error_message)

    def initialize(user:, provider:, api_key:)
      @user = user
      @provider = provider.to_s
      @api_key = api_key.to_s.strip
    end

    def call
      definition = Analysis::ProviderRegistry.fetch(provider)
      return failure(credential: nil, error_message: "Provider does not require credentials") unless definition.requires_credentials

      verify_result = verify_key
      return failure(credential: nil, error_message: verify_result.error_message) if verify_result.failure?

      credential = save_credential

      success(credential: credential, error_message: nil)
    end

    private

    attr_reader :user, :provider, :api_key

    def verify_key
      ProviderCredentials::Verify.call(provider: provider, api_key: api_key)
    end

    def save_credential
      user.provider_credentials.find_or_initialize_by(provider: provider).tap do |credential|
        credential.update!(
          credential_kind: :user_key,
          api_key: api_key,
          key_fingerprint: ProviderCredential.fingerprint_for(api_key),
          status: :connected,
          last_verified_at: Time.current,
          last_error_message: nil
        )
      end
    end
  end
end
