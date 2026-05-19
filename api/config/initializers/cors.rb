# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

frontend_origins = ENV.fetch(
  "FRONTEND_ORIGINS",
  ENV.fetch("FRONTEND_ORIGIN", ENV.fetch("BETTER_AUTH_TRUSTED_ORIGINS", "http://localhost:3000"))
).split(",").map(&:strip).compact_blank

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*frontend_origins)

    resource "*",
      headers: :any,
      credentials: true,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
