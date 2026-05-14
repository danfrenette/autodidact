# frozen_string_literal: true

FactoryBot.define do
  factory :citation do
    association :citable, factory: :concept
    association :source_chunk
    role { "supporting" }
    position { 0 }
  end
end
