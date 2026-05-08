# frozen_string_literal: true

class ProcessSourceSelectionJob < ApplicationJob
  queue_as :default

  def perform(source_selection_id)
    source_selection = SourceSelection.includes(:source).find(source_selection_id)
    Sources::ProcessSelection.call(source_selection: source_selection)
  end
end
