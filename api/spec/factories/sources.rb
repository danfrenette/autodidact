# frozen_string_literal: true

FactoryBot.define do
  factory :source do
    association :user
    title { "The Pragmatic Programmer" }
    kind { "pdf" }
    original_filename { "the-pragmatic-programmer.pdf" }
  end
end
