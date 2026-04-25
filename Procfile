web: cd web && if [ "$TAILSCALE" = "1" ]; then pnpm dev -- --host 0.0.0.0; else pnpm dev; fi
api: cd api && if [ "$TAILSCALE" = "1" ]; then bundle exec rails server -p 3001 -b 0.0.0.0; else PORT=3001 bundle exec rails server; fi
