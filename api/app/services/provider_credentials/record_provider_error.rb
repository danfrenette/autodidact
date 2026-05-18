# frozen_string_literal: true

module ProviderCredentials
  class RecordProviderError < ApplicationService
    Result = ApplicationResult.define(:credential)

    def initialize(user:, error:)
      @user = user
      @error = error
    end

    def call
      return success(credential: nil) unless should_block_provider?

      credential = user.provider_credentials.find_by(provider: error.provider)
      return success(credential: nil) if credential.blank?

      credential.update!(status: :error, last_error_message: error.message)

      success(credential: credential)
    end

    private

    attr_reader :user, :error

    def should_block_provider?
      user.present? && error.provider.present? && error.credential_blocking?
    end
  end
end
