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

      def self.read_onboarding
        read_yaml(Path.onboarding_file)
      end

      def self.write_onboarding(data)
        Path.ensure_directory
        atomic_write(Path.onboarding_file, data)
      end

      def self.read_yaml(path)
        return {} unless File.file?(path)

        YAML.safe_load_file(path, symbolize_names: true, permitted_classes: [Symbol]) || {}
      end

      def self.atomic_write(path, data, mode: 0o644)
        dir = File.dirname(path)

        Tempfile.create("autodidact", dir) do |tmp|
          tmp.write(YAML.dump(deep_stringify_keys(data)))
          tmp.close
          File.chmod(mode, tmp.path)
          File.rename(tmp.path, path.to_s)
        end
      end

      def self.deep_stringify_keys(value)
        case value
        when Hash
          value.each_with_object({}) do |(key, nested), out|
            out[key.to_s] = deep_stringify_keys(nested)
          end
        when Array
          value.map { |nested| deep_stringify_keys(nested) }
        else
          value
        end
      end

      private_class_method :read_yaml, :atomic_write, :deep_stringify_keys
    end
  end
end
