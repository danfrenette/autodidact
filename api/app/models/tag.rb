# frozen_string_literal: true

class Tag < ApplicationRecord
  belongs_to :user, class_name: "Auth::User"
  has_many :taggings, dependent: :destroy

  has_many :sources, through: :taggings, source: :taggable, source_type: "Source"
  has_many :source_selections, through: :taggings, source: :taggable, source_type: "SourceSelection"

  validates :name, presence: true, uniqueness: {scope: :user_id}

  def self.normalize_name(name)
    name.to_s.strip.downcase.gsub(/\s+/, "-")
  end
end
