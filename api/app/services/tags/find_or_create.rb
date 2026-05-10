# frozen_string_literal: true

module Tags
  class FindOrCreate < ApplicationService
    Result = ApplicationResult.define(:tags)

    def initialize(user:, taggable:, tag_names:)
      @user = user
      @taggable = taggable
      @tag_names = tag_names
    end

    def call
      return success(tags: []) if tag_names.empty?

      create_tags_and_taggings

      success(tags: tags)
    end

    private

    attr_reader :user, :taggable, :tag_names

    def create_tags_and_taggings
      Tag.transaction do
        normalized_names.each { |name| create_tag_and_tagging(name) }
      end
    end

    def create_tag_and_tagging(name)
      tag = find_or_create_tag(name)
      find_or_create_tagging(tag)
      tags << tag
    end

    def find_or_create_tag(name)
      Tag.find_or_create_by!(user: user, name: name)
    end

    def find_or_create_tagging(tag)
      taggable.taggings.find_or_create_by!(tag: tag)
    end

    def tags
      @tags ||= []
    end

    def normalized_names
      tag_names.map { |name| normalize_name(name) }.uniq.compact_blank
    end

    def normalize_name(name)
      name.to_s.strip.downcase.gsub(/\s+/, "-")
    end
  end
end
