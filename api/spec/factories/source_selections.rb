# frozen_string_literal: true

FactoryBot.define do
  factory :source_selection do
    association :source
    kind { "chapter" }
    title { "Chapter 1" }
    label { "01" }
    position { {ordinal: 1} }
    locator { {type: "page_range", start: 1, end: 12} }
  end
end
