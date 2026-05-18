# frozen_string_literal: true

class Source < ApplicationRecord
  belongs_to :user, class_name: "Auth::User"

  has_one_attached :asset
  has_many :source_selections, dependent: :destroy
  has_many :taggings, as: :taggable, dependent: :destroy
  has_many :tags, through: :taggings

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

  validates :title, presence: true

  def progress_stats
    total = source_selections.size
    completed = source_selections.count(&:terminal?)
    failed = source_selections.count(&:failed?)

    percentage = total.zero? ? 0 : ((completed.to_f / total) * 100).round

    {
      selection_count: total,
      completed_count: completed,
      failed_count: failed,
      percentage: percentage
    }
  end
end
