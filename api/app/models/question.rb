# frozen_string_literal: true

class Question < ApplicationRecord
  belongs_to :source_selection
  has_many :citations, as: :citable, dependent: :destroy

  validates :tier, presence: true, numericality: {only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 4}
  validates :tier_name, presence: true
  validates :text, presence: true
  validates :answer, presence: true
  validates :position, presence: true, numericality: {only_integer: true, greater_than_or_equal_to: 0}
  validates :position, uniqueness: {scope: :source_selection_id}
end
