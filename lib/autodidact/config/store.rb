# frozen_string_literal: true

require "yaml"
require "tempfile"
require "fileutils"

module Autodidact
  module Config
    class Store
      def self.read_config
        read_yaml(Path.config_file)
      end

      def self.read_secrets
        read_yaml(Path.secrets_file)
      end

      def self.write_config(data)
        Path.ensure_directory
        atomic_write(Path.config_file, data)
      end

      def self.write_secrets(data)
        Path.ensure_directory
        atomic_write(Path.secrets_file, data, mode: 0o600)
      end

      def self.read_yaml(path)
        return {} unless File.file?(path)

        YAML.safe_load_file(path, symbolize_names: true) || {}
      end

      def self.atomic_write(path, data, mode: 0o644)
        dir = File.dirname(path)

        Tempfile.create("autodidact", dir) do |tmp|
          tmp.write(YAML.dump(data.transform_keys(&:to_s)))
          tmp.close
          File.chmod(mode, tmp.path)
          File.rename(tmp.path, path.to_s)
        end
      end

      private_class_method :read_yaml, :atomic_write
    end
  end
end
