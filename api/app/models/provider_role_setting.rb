# frozen_string_literal: true

class ProviderRoleSetting < ApplicationRecord
  belongs_to :user, class_name: "Auth::User"
  belongs_to :provider_credential

  enum :role, {
    embedding: "embedding",
    generation: "generation"
  }

  validates :role, presence: true, uniqueness: {scope: :user_id}
  validates :model, presence: true
  validate :credential_belongs_to_user

  delegate :provider, to: :provider_credential

  private

  def credential_belongs_to_user
    return if provider_credential.blank? || user_id.blank?
    return if provider_credential.user_id == user_id

    errors.add(:provider_credential, "must belong to the same user")
  end
end
