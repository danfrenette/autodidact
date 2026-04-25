# frozen_string_literal: true

json.data do
  json.source do
    json.partial! "shared/source", source: source
  end
end

json.error nil

json.meta({})
