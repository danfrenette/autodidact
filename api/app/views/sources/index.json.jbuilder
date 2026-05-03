# frozen_string_literal: true

json.data do
  json.sources sources do |source|
    json.partial! "shared/source", source: source
  end
end

json.error nil

json.meta({})
