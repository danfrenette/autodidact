# Web Frontend Context

This directory contains the TanStack Start frontend for the Rails backend being co-developed in `../core`.

## Scaffold Commands

Exact TanStack CLI command used:

```bash
npx @tanstack/cli@latest create my-tanstack-app --agent --add-ons tanstack-query,tRPC,sentry,better-auth
```

Follow-up TanStack Intent commands run immediately after scaffolding:

```bash
npx @tanstack/intent@latest install
npx @tanstack/intent@latest list
```

The CLI scaffold was created in a scratch directory first, then merged into `web/` so the real frontend root is `web/` instead of `web/my-tanstack-app/`.

## Stack

- Framework: TanStack Start with React 19 and TanStack Router
- Package manager: pnpm
- Data fetching and caching: TanStack Query
- Typed server transport: tRPC
- Auth: Better Auth mounted at `/api/auth`
- Monitoring: Sentry via `@sentry/tanstackstart-react`
- Styling: Tailwind CSS v4
- Backend target: Rails API in `../core`, backed by Postgres

## Directory Structure

```
src/
├── providers/          # Client-side providers (TanStack Query, TRPC)
│   ├── tanstack-query.tsx
│   └── trpc.tsx
├── server/             # Server-only code
│   └── trpc/
│       ├── init.ts     # tRPC initialization
│       └── router.ts   # tRPC router
├── components/
│   ├── app/            # App shell (header, footer)
│   ├── auth/           # Auth-related UI
│   └── ui/             # shadcn/ui base components
├── features/           # Feature-based modules
│   └── auth/           # Auth feature (client.ts, etc.)
├── lib/                # Utilities and shared code
│   ├── auth.ts         # Better Auth server config
│   ├── utils.ts        # cn() helper
│   └── rails-api.ts    # Rails API client
└── routes/             # TanStack Router file-based routes
    ├── __root.tsx      # Root layout
    ├── _authed/        # Protected routes (pathless layout)
    ├── auth/           # Auth page
    └── api/            # API routes (trpc, auth)
```

## Intent Skills

These are the TanStack Intent skills that were directly consulted before architecture changes in this project.

<!-- intent-skills:start -->
# Skill mappings - when working in these areas, load the linked skill file into context.
skills:
  - task: "TanStack Start setup, router wiring, and server function patterns"
    load: "node_modules/@tanstack/react-start/skills/react-start/SKILL.md"
  - task: "TanStack Start environment boundaries and secret handling"
    load: "node_modules/@tanstack/start-client-core/skills/start-core/execution-model/SKILL.md"
  - task: "TanStack Start deployment, SSR choices, and portable hosting"
    load: "node_modules/@tanstack/start-client-core/skills/start-core/deployment/SKILL.md"
  - task: "tRPC client links and frontend transport setup"
    load: "node_modules/@trpc/client/skills/client-setup/SKILL.md"
  - task: "TanStack Query plus tRPC React integration"
    load: "node_modules/@trpc/tanstack-react-query/skills/react-query-setup/SKILL.md"
  - task: "tRPC auth middleware and protected procedure patterns"
    load: "node_modules/@trpc/server/skills/auth/SKILL.md"
<!-- intent-skills:end -->

## Environment Variables

Local development values live in `.env.local`. A tracked template lives in `.env.example`.

Required now:

- `RAILS_API_URL`: Base URL for the Rails API that the TanStack Start tRPC layer calls
- `BETTER_AUTH_URL`: Public URL for this frontend, usually `http://localhost:3000` in dev
- `BETTER_AUTH_SECRET`: Secret for Better Auth cookie/session signing

Optional but expected before deployment:

- `RAILS_HEALTHCHECK_PATH`: Rails health endpoint path, defaults to `/up`
- `VITE_SENTRY_DSN`: Client/server Sentry DSN
- `VITE_SENTRY_ORG`: Sentry org slug for release tooling
- `VITE_SENTRY_PROJECT`: Sentry project slug for release tooling
- `SENTRY_AUTH_TOKEN`: Token for Sentry release upload steps if added later

## Architectural Decisions

- Keep the frontend in `web/` and keep Rails in `core/`.
- Keep the TanStack CLI integrations represented directly instead of removing them:
  - TanStack Query remains the client cache/state layer.
  - tRPC remains the typed frontend server layer at `/api/trpc`.
  - Better Auth remains mounted at `/api/auth`.
  - Sentry instrumentation remains enabled by configuration.
- Treat tRPC as a frontend BFF layer in front of Rails. The first procedure is `app.status`, which performs a server-side healthcheck against the Rails API.
- Use the same Postgres database as Rails for auth persistence, but keep auth concerns in separate tables from Rails business/domain tables.
- Better Auth should be the writer for auth tables such as users, sessions, accounts, and verification records.
- Rails should own business-domain tables and reference the Better Auth user id where needed instead of duplicating auth/session logic.
- Do not read server secrets from client code. Follow TanStack Start execution-model guidance: `process.env` access stays in server-only paths.
- Prefer same-origin frontend auth and typed server entry points now, then decide later whether Rails consumes Better Auth sessions directly or via an exchanged token/JWT.

## Deployment Notes

- Keep the setup portable by avoiding provider-specific hosting code until deployment is chosen.
- The current app uses the TanStack Start Node deployment path backed by Nitro.
- `pnpm start` loads `.env.local` via `dotenv-cli` and runs `node --import ./instrument.server.mjs .output/server/index.mjs`.
- TanStack Start deployment guidance consulted: Node/Nitro style hosting is the lowest-friction portable default.
- If Rails and the TanStack frontend are deployed separately, confirm CORS, cookie domain, and CSRF behavior before relying on browser-direct calls. The current tRPC BFF pattern reduces that coupling.

## Known Gotchas

- The scaffold defaulted to npm during generation; the real project is intentionally standardized on pnpm.
- Better Auth is scaffolded and operational, but the long-term identity contract with Rails is still undecided.
- A local development secret is currently set in `.env.local` so Better Auth can boot without crashing in local production-mode runs.
- A previous custom Node wrapper was removed after confirming it bypassed framework asset serving and caused the built stylesheet to 404.
- `RAILS_API_URL` must point at a running Rails server or the homepage status card will report a connection error.
- `VITE_` prefixed env vars are exposed to the client bundle. Do not put secrets behind a `VITE_` prefix unless they are truly public.
- SSR-prefetched tRPC queries are easy to add, but authenticated SSR procedures will need explicit request-context and cookie handling as auth-sensitive queries are introduced.

## Next Steps

1. Wire up real auth check in `_authed/route.tsx` when Better Auth connects to DB
2. Replace `app.status` with real Rails-backed resources and mutations.
3. Wire Better Auth to the shared Postgres database and create its auth-specific tables.
4. Decide how Rails should trust Better Auth sessions or exchanged tokens.
5. Add shared API contracts or serializers between `web/` and `core/` if the Rails API shape stabilizes.
6. Add Sentry release/upload automation once deployment is selected.
