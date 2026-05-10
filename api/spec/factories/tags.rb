# frozen_string_literal: true

FactoryBot.define do
  factory :tag do
    association :user
    name { "distributed-systems" }
  end
end
