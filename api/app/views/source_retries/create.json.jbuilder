# frozen_string_literal: true

json.data do
  json.source do
    json.id source.id
    json.status source.status
  end
end

json.error nil

json.meta({})
