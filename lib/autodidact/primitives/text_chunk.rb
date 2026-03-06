# frozen_string_literal: true

module Autodidact
  TextChunk = Data.define(:content, :chunk_index, :token_count, :chunk_id, :byte_offset, :byte_length)
end
