# frozen_string_literal: true

FactoryBot.define do
  factory :concept do
    association :source_selection
    sequence(:name) { |n| "Concept #{n}" }
    classification { "supporting" }
    definition { "A concise definition." }
    why_it_matters { "It helps the learner connect ideas." }

    trait :core do
      classification { "core" }
      name { "ACID Guarantees" }
    end

    trait :supporting do
      classification { "supporting" }
      name { "Transaction Isolation" }
    end

    trait :advanced do
      classification { "advanced" }
      name { "Serializable Snapshot Isolation" }
    end
  end
end
