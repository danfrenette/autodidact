# frozen_string_literal: true

class SourceChunk < ApplicationRecord
  has_neighbors :embedding

  belongs_to :source_selection_content
  has_many :citations, dependent: :destroy

  validates :chunk_index, presence: true, numericality: {greater_than_or_equal_to: 0}
  validates :content, presence: true
  validates :token_count, presence: true, numericality: {greater_than: 0}
  validates :chunk_id, presence: true
  validates :byte_offset, presence: true, numericality: {greater_than_or_equal_to: 0}
  validates :byte_length, presence: true, numericality: {greater_than: 0}
  validates :chunk_index, uniqueness: {scope: :source_selection_content_id}
end
