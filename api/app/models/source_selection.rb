# frozen_string_literal: true

class SourceSelection < ApplicationRecord
  belongs_to :source

  serialize :position, coder: SourceSelection::Position
  serialize :locator, coder: SourceSelection::Locator

  enum :kind, {
    chapter: "chapter"
  }, default: "chapter"

  enum :status, {
    pending: "pending",
    confirmed: "confirmed",
    queued: "queued",
    processing: "processing",
    complete: "complete",
    failed: "failed"
  }, default: "pending"

  validates :title, presence: true
  validates :label, presence: true
  validates :position, presence: true
  validates :locator, presence: true
end
