# frozen_string_literal: true

module Autodidact
  module Provider
    class DevClient
      SIMULATED_LATENCY = 1.5

      def initialize(access_token: nil, model: nil)
        # ignored — matches the provider interface
      end

      def chat(prompt:)
        sleep(SIMULATED_LATENCY)
        stubbed_response
      end

      private

      def stubbed_response
        <<~MARKDOWN
          ## Concepts

          ### [CORE] Stubbed Concept
          **Definition:** This is a stubbed response from the dev provider.
          **Why it matters:** It lets you develop the full pipeline without hitting a real API.

          ## Notable Quotes

          > "This is a placeholder quote from the dev client." (p. 1)

          Preserved because it demonstrates the dev client output format.

          ## Retrieval Questions

          #### Tier 1: Basic Recall

          **What provider generated this note?**

          <span class="spoiler">The dev provider, which returns stubbed responses for development.</span>
        MARKDOWN
      end
    end
  end
end
