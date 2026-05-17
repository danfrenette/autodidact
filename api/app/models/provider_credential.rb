# frozen_string_literal: true

class ProviderCredential < ApplicationRecord
  encrypts :api_key

  belongs_to :user, class_name: "Auth::User"
  has_many :provider_role_settings, dependent: :restrict_with_exception

  enum :credential_kind, {
    user_key: "user_key",
    system: "system"
  }, default: :user_key

  enum :status, {
    connected: "connected",
    disconnected: "disconnected",
    error: "error"
  }, default: :disconnected

  validates :provider, presence: true
  validates :provider, uniqueness: {scope: :user_id}
  validates :api_key, presence: true, if: :user_key?
  validates :key_fingerprint, presence: true, if: :user_key?

  def self.fingerprint_for(api_key)
    api_key.to_s.strip.last(4)
  end

  def display_key
    return nil if key_fingerprint.blank?

    "••••••••#{key_fingerprint}"
  end
end
