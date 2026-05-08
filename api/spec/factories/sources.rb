# frozen_string_literal: true

FactoryBot.define do
  factory :source do
    association :user
    title { "The Pragmatic Programmer" }
    kind { "pdf" }
    author { nil }
    original_filename { "the-pragmatic-programmer.pdf" }

    trait :uploaded do
      status { "uploaded" }
    end

    trait :processing do
      status { "processing" }
    end

    trait :complete do
      status { "complete" }
    end

    trait :failed do
      status { "failed" }
      error_message { "Processing failed" }
    end
  end
end
