# frozen_string_literal: true

FactoryBot.define do
  factory :question do
    association :source_selection
    tier { 1 }
    tier_name { "Basic Recall" }
    text { "What is the central idea?" }
    answer { "The central idea is represented by the source material." }
    position { 0 }
  end
end
