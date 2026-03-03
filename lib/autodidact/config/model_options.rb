# frozen_string_literal: true

require "json"

module Autodidact
  module Config
    class ModelOptions
      class LoadOptionsError < StandardError; end

      API_URL = "https://models.dev/api.json"
      CACHE_TTL_SECONDS = 86_400
      OPEN_TIMEOUT_SECONDS = 2
      REQUEST_TIMEOUT_SECONDS = 2

      def self.call(provider_id:, families: nil)
        new.call(provider_id: provider_id, families: families)
      end

      def call(provider_id:, families: nil)
        extract_model_ids(models: models_for_provider(provider_id), families: families)
      end

      private

      def payload
        @payload ||= cached_payload || refreshed_payload || {}
      end

      def cached_payload
        return nil unless fresh_cache?

        parse_payload(File.read(cache_path))
      end

      def refreshed_payload
        fetched_payload = parse_payload(fetch_remote_payload)
        write_cache(fetched_payload)
        fetched_payload
      rescue LoadOptionsError
        stale_cached_payload
      end

      def stale_cached_payload
        return nil unless File.file?(cache_path)

        parse_payload(File.read(cache_path))
      rescue LoadOptionsError
        nil
      end

      def fetch_remote_payload
        response = connection.get
        raise LoadOptionsError, "models.dev request failed" unless response.success?

        response.body
      rescue Faraday::Error => e
        raise LoadOptionsError, e.message
      end

      def connection
        HttpConnection.call(
          url: API_URL,
          open_timeout: OPEN_TIMEOUT_SECONDS,
          timeout: REQUEST_TIMEOUT_SECONDS
        )
      end

      def parse_payload(raw_payload)
        JSON.parse(raw_payload)
      rescue JSON::ParserError => e
        raise LoadOptionsError, e.message
      end

      def models_for_provider(provider_id)
        provider_payload = payload.fetch(provider_id.to_s, {})
        return normalize_cached_models(provider_payload) if provider_payload.is_a?(Array)

        model_map = provider_payload.fetch("models", {})
        return [] unless model_map.is_a?(Hash)

        model_map.values.filter_map { |model| normalize_model(model) }
      rescue NoMethodError, TypeError => e
        raise LoadOptionsError, e.message
      end

      def normalize_cached_models(provider_payload)
        provider_payload.filter_map { |model| normalize_model(model) }
      end

      def normalize_model(model)
        model_id = model["id"]
        return nil if model_id.nil?

        {
          "id" => model_id,
          "family" => model.fetch("family", "")
        }
      end

      def extract_model_ids(models:, families:)
        options = models.filter_map do |model|
          family = model.fetch("family", "")
          next unless family_match?(family: family, families: families)

          model["id"]
        end

        options.uniq.sort
      end

      def family_match?(family:, families:)
        return true if families.nil?

        families.include?(family)
      end

      def cache_path
        Path.config_dir.join("models_cache.json")
      end

      def fresh_cache?
        File.file?(cache_path) && (Time.now - File.mtime(cache_path)) < CACHE_TTL_SECONDS
      end

      def write_cache(payload)
        return if payload.empty?

        Path.ensure_directory
        File.write(cache_path, JSON.dump(payload))
      end
    end
  end
end
