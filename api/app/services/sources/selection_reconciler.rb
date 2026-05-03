# frozen_string_literal: true

module Sources
  class SelectionReconciler
    Result = Data.define(:success?, :resolved_selections, :failures)

    def initialize(source:, selections: source.source_selections.pending.order(:created_at))
      @source = source
      @selections = selections
    end

    def call
      return Result.new(success?: false, resolved_selections: [], failures: [missing_asset_failure]) unless source.asset.attached?

      resolved = []
      failures = []

      selections.each do |selection|
        authoritative_section = authoritative_section_for(selection)

        if authoritative_section.nil?
          failures << selection_failure(selection)
          next
        end

        resolved << {
          selection: selection,
          title: authoritative_section[:title],
          label: authoritative_section[:label],
          position: authoritative_section[:position],
          locator: authoritative_section[:locator]
        }
      end

      Result.new(success?: failures.empty?, resolved_selections: resolved, failures: failures)
    end

    private

    attr_reader :source, :selections

    def authoritative_section_for(selection)
      authoritative_sections.find do |section|
        section[:title] == selection.title && locator_start(section[:locator]) == locator_start(selection.locator)
      end
    end

    def authoritative_sections
      @authoritative_sections ||= source.asset.open do |file|
        Sources::Inspector.new(file_path: file.path, kind: source.kind).call.fetch(:subsections)
      end
    end

    def locator_start(locator)
      locator.with_indifferent_access[:start]
    end

    def selection_failure(selection)
      {
        source_selection_id: selection.id,
        title: selection.title,
        label: selection.label,
        reason: "no_matching_chapter",
        details: {
          optimistic_locator: selection.locator,
          inspected_titles: authoritative_sections.map { |section| section[:title] }
        }
      }
    end

    def missing_asset_failure
      {
        source_selection_id: nil,
        title: nil,
        label: nil,
        reason: "missing_uploaded_asset",
        details: {
          source_id: source.id
        }
      }
    end
  end
end
