# frozen_string_literal: true

FactoryBot.define do
  factory :source_chunk do
    association :source_selection_content
    chunk_index { 0 }
    content { "Chapter text for analysis." }
    token_count { 5 }
    chunk_id { Digest::SHA256.hexdigest(content) }
    byte_offset { 0 }
    byte_length { content.bytesize }
  end
end
