# frozen_string_literal: true

FactoryBot.define do
  factory :source_selection_content do
    association :source_selection
    raw_text { "Chapter text for analysis." }
    locator_spans { [{locator: {type: "page", page: 1}, byte_offset: 0, byte_length: 26}] }
  end
end
