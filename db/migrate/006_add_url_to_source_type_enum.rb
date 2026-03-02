# frozen_string_literal: true

Sequel.migration do
  change do
    add_enum_value(:source_type, "url")
  end
end
