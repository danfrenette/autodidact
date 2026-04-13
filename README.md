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
