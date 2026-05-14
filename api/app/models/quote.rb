# frozen_string_literal: true

class Quote < ApplicationRecord
  belongs_to :source_selection
  has_many :citations, as: :citable, dependent: :destroy

  validates :text, presence: true
  validates :position, presence: true, numericality: {only_integer: true, greater_than_or_equal_to: 0}
  validates :position, uniqueness: {scope: :source_selection_id}
end
