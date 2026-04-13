# Autodidact Auth And Login Plan

This file turns the sign-in design intent in `DESIGN.md` into an implementation plan for the `web/` and `core/` apps.

Primary design reference:
- `DESIGN.md`, especially `## Sign In (Access Terminal)`

Supporting visual reference:
- Paper artboard `Sign In — A+C Hybrid`

## Decisions Locked In

- Authentication will be OAuth-only for the first implementation pass.
- Google is the first provider to ship.
- Better Auth will own auth persistence and writes.
- Rails should be able to read auth data, but does not need to write auth/session/account internals.
- `/design` should exist as a dev-only route for visual validation and component-by-component iteration.
- The first left-panel implementation should use the best-looking low-effort placeholder rather than jumping straight to WebGL.

## Architecture Direction

### Frontend

- Keep TanStack Start in `web/`.
- Treat `/auth` as a fullscreen route outside the current app shell.
- Move the existing site chrome into a pathless layout route so normal pages still get the shared header/footer.
- Keep `__root.tsx` document-only.

### Auth Persistence

- Use the same Postgres database as Rails.
- Give Better Auth a dedicated Postgres schema, preferably `auth`.
- Let Better Auth create and own the auth tables inside that schema.
- Point Better Auth at the `auth` schema via Postgres `search_path`.

### Rails Read Access

- Add read-oriented Rails models under `core/app/models/auth/`.
- Map them to Better Auth tables via `self.table_name = "auth.users"` style mappings or a namespace table prefix helper.
- Keep Rails as a consumer of auth data, not the source of truth for auth writes.

## Goals

1. Replace the scaffolded email/password auth page with the designed OAuth login experience.
2. Establish shadcn as the base primitive layer for the frontend design system.
3. Introduce a dev-only `/design` route for fast visual iteration.
4. Wire Better Auth to shared Postgres storage.
5. Make Better Auth data readable from Rails.
6. Get Google sign-in working locally end to end.

## Non-Goals For The First Pass

- GitHub OAuth.
- WebGL constellation rendering.
- View Transitions API auth-to-dashboard transition.
- Advanced return-visitor motion states.
- Rails-side auth writes.
- Production-grade font delivery for proprietary fonts.

## Implementation Phases

### Phase 1: Route And Shell Cleanup

Goal: isolate `/auth` from the current global header/footer and create the right structure for future fullscreen routes.

Tasks:
- Refactor `web/src/routes/__root.tsx` so it only owns the document shell.
- Introduce a pathless app-shell layout route that renders the existing `Header` and `Footer`.
- Move current app pages under the app-shell layout.
- Keep `/auth` outside the app-shell layout.
- Add a pathless dev-only layout or route guard for `/design` using `import.meta.env.DEV`.

Acceptance criteria:
- `/auth` renders without the existing site header/footer.
- Existing app pages still render inside the current shell.
- `/design` is available in development and not exposed in non-dev runs.

### Phase 2: Design System Foundation

Goal: switch from the current seafoam scaffold styling to an Autodidact-aligned dark design system built on shadcn primitives.

Tasks:
- Initialize shadcn in `web/`.
- Add only the first required primitives:
  - `button`
  - `tabs`
  - `separator`
- Replace the current global design tokens with the dark token set from `DESIGN.md`.
- Add semantic font variables for:
  - display: `PP Neue York`
  - ui/body: `Karla`
  - data/status: `Departure Mono`
- Tune the shadcn theme layer to fit the design instead of using stock defaults.

Acceptance criteria:
- The app has a coherent dark token system that matches `DESIGN.md`.
- shadcn is installed and usable for future components.
- Typography in the auth surface is visually close to the Paper mockup.

### Phase 3: Dev-Only `/design` Route

Goal: create a safe sandbox for visual implementation work before binding components to real auth behavior.

Tasks:
- Add a `/design` route under a dev-only guard.
- Build a small internal gallery that renders:
  - typography specimens
  - color/token swatches
  - auth tab toggle
  - OAuth button
  - boot-sequence row
  - left-panel placeholder shell
  - full auth page composition

Acceptance criteria:
- Components can be reviewed visually in isolation.
- The route is easy to use while iterating on the auth page.

### Phase 4: Auth Page Composition

Goal: build the real `/auth` page to match the `Sign In (Access Terminal)` design direction.

Tasks:
- Replace the current scaffolded email/password form.
- Build the split-screen fullscreen layout.
- Right panel:
  - copy-only sign in / sign up tabs
  - operator authentication label
  - contextual description text
  - Google OAuth button
  - terms footer
- Left panel:
  - Autodidact wordmark and value prop
  - static or lightly animated constellation placeholder
  - blueprint grid overlay
  - registration marks
  - boot sequence rows with `OPERATOR AUTH` marked `REQUIRED`
- Keep motion restrained for the first pass.

Low-effort placeholder recommendation:
- Use SVG for the dormant constellation field.
- Include one pulsing red node.
- Add a subtle grid/noise treatment via CSS.
- Skip WebGL until the login surface and auth flow are stable.

Acceptance criteria:
- `/auth` is visually recognizably aligned with the Paper mockup.
- The page no longer looks like scaffold output.
- The UI is OAuth-only.

### Phase 5: Better Auth Database Wiring

Goal: move Better Auth from cookie-only scaffolding to real Postgres-backed persistence.

Tasks:
- Add `pg` to `web/`.
- Update `web/src/lib/auth.ts` to use a Postgres pool.
- Configure the pool to use the `auth` schema via `search_path`.
- Keep `tanstackStartCookies()` as the last Better Auth plugin.
- Configure Google as the first social provider.
- Add any required auth environment variables to `.env.example` and docs.

Expected environment variables:
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `DATABASE_URL` or equivalent Postgres connection string for Better Auth
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Acceptance criteria:
- Better Auth boots with Postgres configured.
- Google is the only enabled social provider in the first pass.

### Phase 6: Database Schema And Migration Setup

Goal: make the Better Auth schema explicit and manageable across both apps.

Tasks:
- Add a Rails migration that ensures the `auth` schema exists.
- Run Better Auth's migration workflow against that schema.
- Document the schema and migration flow in project docs.

Recommended migration direction:
- Let Rails establish the `auth` schema boundary.
- Let Better Auth create its own tables inside that schema.

Acceptance criteria:
- Better Auth tables exist in the shared database under `auth`.
- The migration path is documented and repeatable.

### Phase 7: Rails Read Models

Goal: give Rails clean read access to Better Auth data.

Tasks:
- Add `Auth::User`.
- Add `Auth::Account`.
- Add `Auth::Session`.
- Add `Auth::Verification` if Better Auth creates that table in the chosen config.
- Mark intent in code and docs that these models are read-oriented.

Acceptance criteria:
- Rails console can query Better Auth-backed records.
- Rails can reference auth users from future domain models without owning the auth tables.

### Phase 8: Real OAuth Flow

Goal: replace the placeholder login UI with a working Google sign-in flow.

Tasks:
- Use Better Auth social sign-in from the `/auth` page.
- Redirect authenticated users away from `/auth`.
- Handle loading and auth failure states with the new design language.
- Keep the first flow simple and same-origin.

Acceptance criteria:
- A local user can click the Google button, complete OAuth, and return authenticated.
- Session state is reflected correctly in the frontend.

## Google OAuth Setup Refresher

1. Open Google Cloud Console.
2. Create or select a project.
3. Go to `APIs & Services` -> `Credentials`.
4. Create an `OAuth client ID`.
5. Choose `Web application`.
6. Add local redirect URI:
   - `http://localhost:3000/api/auth/callback/google`
7. Add local origin if prompted:
   - `http://localhost:3000`
8. Save the generated credentials into local env:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `BETTER_AUTH_URL=http://localhost:3000`

## File-Level Expectations

### Likely frontend files to touch

- `web/src/routes/__root.tsx`
- new pathless app-shell route file(s)
- `web/src/routes/auth.tsx`
- new `/design` route file(s)
- `web/src/lib/auth.ts`
- `web/src/lib/auth-client.ts`
- `web/src/styles.css`
- new `web/src/components/ui/*` shadcn primitives
- new auth-specific components under `web/src/components/` or `web/src/features/auth/`
- `web/.env.example`
- `web/AGENTS.md`

### Likely Rails files to touch

- new migration under `core/db/migrate/`
- `core/app/models/auth/user.rb`
- `core/app/models/auth/account.rb`
- `core/app/models/auth/session.rb`
- optionally `core/app/models/auth/verification.rb`

## Risks And Watchpoints

- `PP Neue York` may not be straightforward to ship as a webfont in all environments, so local parity may be better than production parity at first.
- Better Auth table names and required tables should be validated from the actual generated schema before finalizing Rails models.
- Auth pages should not accidentally inherit legacy site-shell assumptions.
- `/design` should stay clearly internal and guarded in non-dev contexts.
- The first pass should avoid over-engineering the constellation field before auth behavior is stable.

## Recommended Execution Order

1. Route/layout cleanup.
2. shadcn initialization and token pass.
3. `/design` sandbox.
4. Auth page composition.
5. Better Auth Postgres wiring.
6. `auth` schema creation and Better Auth migrations.
7. Rails read models.
8. Real Google OAuth flow.
9. Visual polish and follow-up motion.

## Definition Of Done For The First Milestone

- `/auth` is fullscreen, OAuth-only, and visually aligned with the mockup.
- `/design` exists and is dev-only.
- Better Auth persists to the shared Postgres database.
- Better Auth tables live in a separate auth-oriented boundary.
- Rails can read Better Auth records through models.
- Google login works locally.
