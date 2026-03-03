# frozen_string_literal: true

Sequel.migration do
  up do
    run "ALTER TYPE source_type ADD VALUE IF NOT EXISTS 'url'"
  end

  down do
    # PostgreSQL does not support removing enum values
  end
end
