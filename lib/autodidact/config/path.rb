# frozen_string_literal: true

module Autodidact
  module Config
    module Path
      def self.config_dir
        base = ENV.fetch("XDG_CONFIG_HOME", File.join(Dir.home, ".config"))
        Pathname.new(File.join(base, "autodidact"))
      end

      def self.config_file
        config_dir.join("config.yml")
      end

      def self.secrets_file
        config_dir.join("secrets.yml")
      end

      def self.ensure_directory
        FileUtils.mkdir_p(config_dir)
      end
    end
  end
end
