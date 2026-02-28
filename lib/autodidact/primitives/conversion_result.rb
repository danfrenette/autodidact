# frozen_string_literal: true

module Autodidact
  ConversionResult = Data.define(
    :raw_text,
    :source_path,
    :source_type,
    :selection_kind,
    :selection_payload,
    :note_filename
  ) do
    def continue?
      true
    end
  end
end
