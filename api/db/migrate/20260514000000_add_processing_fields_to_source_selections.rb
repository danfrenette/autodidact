# frozen_string_literal: true

class AddProcessingFieldsToSourceSelections < ActiveRecord::Migration[8.1]
  def change
    change_table :source_selections do |t|
      t.string :pipeline_stage
      t.jsonb :error_details, null: false, default: {}
    end
  end
end
