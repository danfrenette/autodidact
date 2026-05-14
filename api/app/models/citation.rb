# frozen_string_literal: true

class Citation < ApplicationRecord
  belongs_to :citable, polymorphic: true
  belongs_to :source_chunk

  enum :role, {
    supporting: "supporting",
    quote_source: "quote_source",
    answer_source: "answer_source",
    connection_source: "connection_source"
  }, default: "supporting"

  validates :role, presence: true
  validates :position, presence: true, numericality: {only_integer: true, greater_than_or_equal_to: 0}
  validates :position, uniqueness: {scope: [:citable_type, :citable_id]}
end
