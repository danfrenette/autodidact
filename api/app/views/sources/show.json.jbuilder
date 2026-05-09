json.data do
  json.partial! "shared/source", source: source
  json.selections source.source_selections.order(:position) do |selection|
    json.partial! "shared/source_selection", source_selection: selection
  end
end
json.error nil
json.meta({})
