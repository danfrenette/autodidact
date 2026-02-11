# frozen_string_literal: true

module Autodidact
  module Ingest
    class PdfIngestor
      def call(path:, start_page: nil, end_page: nil)
        raise NotImplementedError, "PDF ingestion not yet implemented"
      end
    end
  end
end
