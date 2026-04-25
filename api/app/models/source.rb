# frozen_string_literal: true

class Source < ApplicationRecord
  has_one_attached :asset
  has_many :source_selections, dependent: :destroy

  enum :status, {
    draft: "draft",
    uploading: "uploading",
    uploaded: "uploaded",
    processing: "processing",
    complete: "complete",
    failed: "failed"
  }, default: "draft"

  enum :kind, {
    pdf: "pdf",
    audio: "audio",
    video: "video",
    text: "text",
    url: "url"
  }, default: "pdf"

  validates :user_id, presence: true
  validates :title, presence: true
end
