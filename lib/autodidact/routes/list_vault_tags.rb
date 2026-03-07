# frozen_string_literal: true

module Autodidact
  module Routes
    class ListVaultTags < Route
      def call
        Commands::ListVaultTags.call
      end
    end
  end
end
