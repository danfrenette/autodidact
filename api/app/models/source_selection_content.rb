# frozen_string_literal: true

class SourceSelectionContent < ApplicationRecord
  belongs_to :source_selection
  has_many :source_chunks, dependent: :destroy

  validates :raw_text, presence: true
  validates :source_selection_id, uniqueness: true
end
