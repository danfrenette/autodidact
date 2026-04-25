# frozen_string_literal: true

json.data do
  json.sourceSelection do
    json.partial! "shared/source_selection", source_selection: source_selection
  end
end

json.error nil

json.meta({})
