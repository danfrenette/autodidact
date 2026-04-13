import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useTRPC } from '#/integrations/trpc/react'

export const Route = createFileRoute('/_app/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.app.status.queryOptions(),
    )
  },
  component: App,
})

function StatusPill({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'good' | 'warn'
}) {
  const styles =
    tone === 'good'
      ? 'border-emerald-300/70 bg-emerald-100/80 text-emerald-900'
      : 'border-amber-300/70 bg-amber-100/80 text-amber-950'

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase ${styles}`}
    >
      {children}
    </span>
  )
}

function App() {
  const trpc = useTRPC()
  const { data } = useQuery(trpc.app.status.queryOptions())

  if (!data) {
    return null
  }

  const railsTone = data.rails.ok ? 'good' : 'warn'
  const sentryTone = data.monitoring.configured ? 'good' : 'warn'

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">TanStack Start + Rails API</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Frontend-first Rails integration with the requested TanStack stack.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          This app keeps TanStack Query, tRPC, Better Auth, and Sentry in place
          while treating the Rails app in <code>core/</code> as the system of
          record for application data.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/about"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            Architecture Notes
          </Link>
          <Link
            to="/auth"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            Better Auth Flow
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            'TanStack Query',
            'Server state stays in TanStack Query, with SSR hydration already wired in.',
          ],
          [
            'tRPC BFF Layer',
            'The frontend exposes a typed tRPC layer that can proxy or compose Rails endpoints.',
          ],
          [
            'Better Auth',
            'Cookie-based auth routes are scaffolded now, so session UX can be built before Rails auth hardens.',
          ],
          [
            'Sentry',
            'Error monitoring is retained from the scaffold and only needs environment values to turn on.',
          ],
        ].map(([title, desc], index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {title}
            </h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="island-shell rounded-2xl p-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="island-kicker mb-0">Runtime Status</p>
            <StatusPill tone={railsTone}>
              Rails {data.rails.ok ? 'reachable' : 'needs attention'}
            </StatusPill>
            <StatusPill tone={sentryTone}>
              Sentry {data.monitoring.configured ? 'configured' : 'not configured'}
            </StatusPill>
          </div>

          <dl className="mt-5 grid gap-4 text-sm text-[var(--sea-ink-soft)] sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[var(--sea-ink)]">Rails API URL</dt>
              <dd className="mt-1 break-all">{data.rails.baseUrl ?? 'Set RAILS_API_URL'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--sea-ink)]">Healthcheck path</dt>
              <dd className="mt-1">{data.rails.healthcheckPath}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--sea-ink)]">Last HTTP status</dt>
              <dd className="mt-1">{data.rails.status ?? 'n/a'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--sea-ink)]">Auth endpoint</dt>
              <dd className="mt-1">{data.auth.endpoint}</dd>
            </div>
          </dl>

          {data.rails.error ? (
            <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              {data.rails.error}
            </p>
          ) : null}

          {data.rails.bodyPreview ? (
            <p className="mt-4 text-sm text-[var(--sea-ink-soft)]">
              Preview: <code>{data.rails.bodyPreview}</code>
            </p>
          ) : null}
        </article>

        <article className="island-shell rounded-2xl p-6">
          <p className="island-kicker mb-2">Next Steps</p>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
            <li>Point <code>RAILS_API_URL</code> at the Rails app in <code>core/</code>.</li>
            <li>Replace the demo status query with real Rails resources and mutations.</li>
            <li>Decide whether Better Auth should own user persistence or delegate identity to Rails.</li>
            <li>Set the Sentry environment values before the first deployed build.</li>
          </ul>
        </article>
      </section>
    </main>
  )
}
