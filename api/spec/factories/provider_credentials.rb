# frozen_string_literal: true

FactoryBot.define do
  factory :provider_credential do
    association :user
    provider { "openai" }
    credential_kind { "user_key" }
    api_key { "sk-test-1234" }
    key_fingerprint { "1234" }
    status { "connected" }
    last_verified_at { Time.current }

    trait :mock do
      provider { "mock" }
      credential_kind { "system" }
      api_key { nil }
      key_fingerprint { nil }
    end
  end
end
