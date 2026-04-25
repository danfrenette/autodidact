# Better Auth Rails Integration Plan

## Goal

Set up the Rails app to cleanly consume Better Auth data from a shared Postgres database while keeping Better Auth as the only writer to auth tables.

## Architecture Decision

- Better Auth owns auth persistence and writes.
- Rails reads auth data through namespaced, read-only models.
- Auth tables live in Postgres schema `auth`.
- Rails business tables live in the normal app schema.
- Rails-owned tables reference Better Auth users by `auth_user_id` as a `string`.
- Prefer plural auth table names:
  - `auth.users`
  - `auth.accounts`
  - `auth.sessions`
  - `auth.verifications`

## Why This Direction

- Keeps auth infrastructure separate from product and domain data.
- Avoids future table-name collisions with Rails concepts like `users` or `sessions`.
- Makes database ownership and responsibilities obvious.
- Lets Better Auth evolve independently inside a bounded schema.
- Keeps Rails simple: it consumes identity, but does not implement identity.

## Execution Plan

1. Finalize the auth table contract
   - Confirm Better Auth will use the `auth` schema.
   - Confirm Better Auth will use plural model and table names.
   - Confirm initial plugin scope so we know whether extra auth tables or columns will appear beyond the core four.

2. Establish the shared database boundary
   - Add a Rails migration whose only job is to ensure the `auth` schema exists.
   - Keep Better Auth table creation out of Rails migrations.
   - Use the shared Postgres instance for both `web/` and `api/`.

3. Wire Better Auth to the `auth` schema
   - Update Better Auth Postgres config to use a `pg.Pool`.
   - Set `search_path=auth,public`.
   - Keep `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` as env-driven config.
   - Re-run Better Auth migration flow after config is finalized.

4. Create Better Auth tables through Better Auth
   - Run Better Auth CLI migration against the shared database.
   - Verify the core tables exist in `auth`.
   - Verify actual table names and column shapes before finalizing Rails models.

5. Add Rails read models for auth data
   - Create `Auth::User`.
   - Create `Auth::Account`.
   - Create `Auth::Session`.
   - Create `Auth::Verification`.
   - Add only the associations needed for querying:
     - user -> accounts
     - user -> sessions
     - account -> user
     - session -> user

6. Make Rails auth models explicitly read-only
   - Add a shared read-only pattern for the `Auth` namespace.
   - Ensure accidental writes from Rails fail fast.
   - Treat these models as integration models, not domain models.

7. Define the Rails-side identity contract
   - Rails should use Better Auth ids directly.
   - Any Rails-owned table that belongs to a user should use `auth_user_id :string`.
   - Do not introduce a separate Rails `users` table in the first pass.

8. Add the first Rails-owned domain models
   - Start with the models that align with the current product direction:
     - `Source`
     - `SourceSection`
     - `Question`
     - `ReviewResponse`
     - `UserPreference`
     - `ApiKey`
   - Attach them to Better Auth identities through `auth_user_id`.

9. Document the database ownership rules
   - Better Auth writes `auth.*`.
   - Rails reads `auth.*`.
   - Rails owns business tables outside `auth`.
   - Auth schema changes come from Better Auth config and Better Auth migrations, not Rails table definitions.

10. Validate in both apps

- In `web/`:
  - Better Auth boots successfully with Postgres.
  - `/api/auth/ok` returns healthy status.
- In `api/`:
  - Rails console can query `Auth::User.first`.
  - Rails models can join or reference auth users as expected.
- Confirm no Rails code path attempts to write auth records.

## Deliverables

- A Rails migration that creates the `auth` schema boundary.
- Better Auth configured to persist to shared Postgres under `auth`.
- Better Auth core tables created by Better Auth.
- Read-only Rails models under `api/app/models/auth/`.
- Initial Rails-owned domain migrations using `auth_user_id :string`.
- Documentation for the cross-app auth and data ownership model.

## Risks And Watchpoints

- Better Auth table names and fields must be validated from the actual generated schema, not assumed.
- Plugins may add extra auth tables or columns later.
- Session storage behavior can change if secondary storage is introduced later.
- Singular vs plural naming should be locked before migrations are run.
- The docs still reference `core/` in a few places, but the actual Rails app is `api/`; implementation should follow the real repo layout.

## Recommended Order

1. Lock naming and schema decisions.
2. Add Rails schema-boundary migration.
3. Wire Better Auth to shared Postgres.
4. Run Better Auth migrations.
5. Add Rails read-only auth models.
6. Add first Rails-owned domain tables.
7. Update docs.

## Definition Of Done

- Better Auth tables exist in `auth`.
- Better Auth remains the only writer to auth tables.
- Rails can query auth records through `Auth::*` models.
- Rails-owned business tables reference Better Auth ids without duplicating auth tables.
- The ownership boundary is documented and easy to follow.

## Locked Assumptions

1. Use `auth` schema.
2. Use plural Better Auth table names.
3. Do not add a separate Rails `users` table in the first pass.
