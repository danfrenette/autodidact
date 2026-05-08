json.array! @concepts do |concept|
  json.partial! "concepts/concept", concept: concept
end
