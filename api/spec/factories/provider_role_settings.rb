# frozen_string_literal: true

FactoryBot.define do
  factory :provider_role_setting do
    association :user
    association :provider_credential
    role { "embedding" }
    model { "text-embedding-3-small" }

    trait :generation do
      role { "generation" }
      model { "gpt-4o-mini" }
    end
  end
end
