# frozen_string_literal: true

module Autodidact
  RetrievedChunk = Data.define(:content, :chunk_index, :source_path, :token_count)
end
