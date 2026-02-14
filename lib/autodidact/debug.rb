# frozen_string_literal: true

module Autodidact
  module Debug
    # Drop a remote pry breakpoint that's safe to use in the
    # JSON-RPC backend. Redirects $stdout to $stderr so
    # pry-remote's banner messages don't pollute the transport.
    #
    # Usage: Autodidact::Debug.remote_pry(binding)
    def self.remote_pry(target_binding)
      require "pry-remote"

      original_stdout = $stdout
      $stdout = $stderr
      target_binding.remote_pry
    ensure
      $stdout = original_stdout
    end
  end
end
