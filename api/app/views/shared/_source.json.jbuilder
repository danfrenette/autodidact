# frozen_string_literal: true

progress = source.progress_stats

json.id source.id
json.title source.title
json.kind source.kind
json.originalFilename source.original_filename
json.status source.status
json.assetAttached source.asset.attached?
json.selectionCount progress[:selection_count]
json.completedCount progress[:completed_count]
json.progressPercentage progress[:percentage]
json.createdAt source.created_at.iso8601
json.updatedAt source.updated_at.iso8601
