json.data do
  json.partial! "shared/source", source: source
  json.selections source.source_selections.order(:position) do |selection|
    json.partial! "source_selections/selection", selection: selection
  end
end
json.error nil
json.meta({})