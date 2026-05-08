# frozen_string_literal: true

class Concept < ApplicationRecord
  belongs_to :source_selection

  enum :classification, {
    core: "core",
    supporting: "supporting",
    advanced: "advanced"
  }, default: "supporting"

  validates :name, presence: true
  validates :name, uniqueness: {scope: :source_selection_id}
  validates :classification, presence: true
end
