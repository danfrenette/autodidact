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

      FALLBACK_MODELS = [
        "gpt-4.1",
        "gpt-4.1-mini",
        "gpt-4o-mini",
        "o4-mini"
      ].freeze

      def self.call
        new.call
      end

      def call
        cached_models || refreshed_models || FALLBACK_MODELS
      end

      private

      def cached_models
        return nil unless fresh_cache?

        parse_cache(File.read(cache_path))
      end

      def refreshed_models
        models = parse_remote(fetch_remote_payload)
        write_cache(models)
        models
      rescue LoadOptionsError
        stale_cached_models
      end

      def stale_cached_models
        return nil unless File.file?(cache_path)

        parse_cache(File.read(cache_path))
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

      def parse_remote(payload)
        parsed = JSON.parse(payload)
        models = parsed.fetch("openai", {}).fetch("models", {}).values
        parse_models(models)
      rescue JSON::ParserError, NoMethodError => e
        raise LoadOptionsError, e.message
      end

      def parse_cache(payload)
        parse_models(JSON.parse(payload).fetch("models", []))
      rescue JSON::ParserError, NoMethodError => e
        raise LoadOptionsError, e.message
      end

      def parse_models(models)
        options = models.filter_map do |model|
          model_id = model["id"]
          family = model.fetch("family", "")
          next if model_id.nil? || family.start_with?("text-embedding")

          model_id
        end

        options.uniq.sort
      end

      def cache_path
        Path.config_dir.join("models_cache.json")
      end

      def fresh_cache?
        File.file?(cache_path) && (Time.now - File.mtime(cache_path)) < CACHE_TTL_SECONDS
      end

      def write_cache(models)
        return if models.empty?

        Path.ensure_directory

        cache_models = models.map { |model| {"id" => model, "family" => model_family(model)} }
        File.write(cache_path, JSON.dump({"models" => cache_models}))
      end

      def model_family(model)
        model.start_with?("text-embedding") ? "text-embedding" : ""
      end
    end
  end
end
