# frozen_string_literal: true

module Autodidact
  module Analysis
    module FixedPrompt
      TEMPLATE = <<~PROMPT
        You are generating a study note from source material.

        Return markdown with exactly these sections:
        ## Summary
        - 3 to 5 bullet points summarizing the source

        ## Key Ideas
        - 5 to 8 bullet points with concise explanations

        ## Review Questions
        - 5 numbered questions that test understanding

        Keep the output concise, accurate, and grounded only in the provided text.

        Source text:
        %<raw_text>s
      PROMPT

      def self.call(raw_text:)
        format(TEMPLATE, raw_text: raw_text)
      end
    end
  end
end
