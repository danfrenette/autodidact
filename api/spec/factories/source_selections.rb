# frozen_string_literal: true

FactoryBot.define do
  factory :source_selection do
    association :source
    kind { "chapter" }
    title { "Chapter 1" }
    label { "01" }
    position { {ordinal: 1} }
    locator { {type: "page_range", start: 1, end: 12} }

    trait :pending do
      status { "pending" }
    end

    trait :complete do
      status { "complete" }
    end

    trait :processing do
      status { "processing" }
    end

    trait :failed do
      status { "failed" }
      error_message { "Processing failed" }
    end
  end
end
