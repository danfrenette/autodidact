# frozen_string_literal: true

require "pdf/reader"

module Autodidact
  class PdfDocument
    def initialize(path)
      @path = path
    end

    def chapters
      outline_ref = catalog[:Outlines]
      return [] unless outline_ref

      outlines = objects[outline_ref]
      first_ref = outlines[:First]
      return [] unless first_ref

      items = []
      walk_outline(ref: first_ref, items: items)
      items
    end

    def page_count
      reader.page_count
    end

    def page_text(number)
      reader.pages[number - 1]&.text || ""
    end

    def pages_text(range)
      range.map { |n| page_text(n) }.reject(&:empty?).join("\n\n")
    end

    private

    attr_reader :path

    def reader
      @reader ||= PDF::Reader.new(path)
    end

    def objects
      reader.objects
    end

    def catalog
      objects[objects.trailer[:Root]]
    end

    def walk_outline(ref:, items:)
      node = objects[ref]

      title = normalize_title(node[:Title])
      page = resolve_page(node)
      items << {title: title, page: page} if title && page

      walk_outline(ref: node[:First], items: items) if node[:First]
      walk_outline(ref: node[:Next], items: items) if node[:Next]
    end

    def resolve_page(node)
      ref = page_ref_from_dest(node[:Dest]) || page_ref_from_action(node[:A])
      return unless ref&.respond_to?(:id)

      page_map[ref.id]
    end

    def page_ref_from_dest(dest)
      resolved = dest
      resolved = objects[resolved] if resolved.is_a?(PDF::Reader::Reference)
      resolved[0] if resolved.is_a?(Array)
    end

    def page_ref_from_action(action)
      resolved = action
      resolved = objects[resolved] if resolved.is_a?(PDF::Reader::Reference)
      return unless resolved.is_a?(Hash) && resolved[:S] == :GoTo

      page_ref_from_dest(resolved[:D])
    end

    def page_map
      @page_map ||= build_page_map
    end

    def build_page_map
      page_refs = {}
      objects.each do |ref, object|
        next unless ref.respond_to?(:id)
        next unless object.is_a?(Hash) && object[:Type] == :Page

        page_refs[object.object_id] = ref.id
      end

      reader.pages.each_with_object({}) do |page, map|
        ref_id = page_refs[page.page_object.object_id]
        map[ref_id] = page.number if ref_id
      end
    end

    def normalize_title(value)
      title = value
        .to_s
        .encode("UTF-8", invalid: :replace, undef: :replace, replace: "")
        .gsub(/\s+/, " ")
        .strip
      title.empty? ? nil : title
    end
  end
end
