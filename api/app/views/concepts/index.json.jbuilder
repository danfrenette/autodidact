json.data do
  json.concepts concepts do |concept|
    json.partial! "concepts/concept", concept: concept
  end
end
json.error nil
json.meta({})
