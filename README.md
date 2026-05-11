# Autodidact

Autodidact is a monorepo with two active applications:

- `web/` — TanStack Start frontend on `http://localhost:3000`
- `api/` — Rails API on `http://localhost:3001`

## Prerequisites

- Ruby `3.3.1`
- Bundler
- Node.js
- pnpm
- PostgreSQL

## Setup

From the repo root:

```bash
./bin/setup
```

This will:

- install Ruby gems for the Rails API
- install Node dependencies for the frontend
- prepare the Rails database

## Development

Start both apps from the repo root:

```bash
./bin/dev
```

That runs:

- `web` on port `3000`
- `api` on port `3001`

To expose both apps privately on your Tailscale network while developing:

```bash
./bin/dev-tailnet
```

That starts the same dev processes and serves:

- `web` on `https://<tailnet-hostname>.<tailnet-name>.ts.net:3000`
- `api` on `https://<tailnet-hostname>.<tailnet-name>.ts.net:3001`

Use the full `https://...ts.net` URL printed by the script. Opening `http://...` will fail with `Client sent an HTTP request to an HTTPS server`, and using the short hostname or Tailscale IP can show Chrome certificate warnings.

If you prefer to run the frontend and API in separate terminals, configure Tailscale once:

```bash
./bin/tailnet-serve
```

The script prints `BETTER_AUTH_URL` and `BETTER_AUTH_TRUSTED_ORIGINS` exports for the Tailscale URL. Run those exports in the terminal that starts the frontend so OAuth requests trust the `.ts.net` origin.

Then start the services separately:

```bash
./bin/dev-services
./bin/dev-api
```

Stop exposing the ports with:

```bash
Ctrl-C
```

If the terminal exits unexpectedly, inspect or clear Tailscale routes with `tailscale serve status` and `tailscale serve reset`.

## App-specific commands

Frontend:

```bash
cd web
pnpm dev
pnpm test
pnpm build
```

Rails API:

```bash
cd api
bin/rails server -p 3001
bin/rails test
bin/rails db:prepare
```
