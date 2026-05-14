# frozen_string_literal: true

FactoryBot.define do
  factory :quote do
    association :source_selection
    text { "A notable passage from the source." }
    note { "This passage crystallizes the main point." }
    position { 0 }
  end
end
