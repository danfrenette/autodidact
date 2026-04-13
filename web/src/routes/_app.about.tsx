import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/about')({
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Architecture</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          A TanStack Start frontend positioned in front of Rails.
        </h1>
        <div className="grid gap-4 text-base leading-8 text-[var(--sea-ink-soft)]">
          <p className="m-0 max-w-3xl">
            The current setup keeps TanStack Start responsible for routing, SSR,
            and the browser experience. Rails remains the application backend
            and Postgres owner, while tRPC gives the frontend a typed server-side
            integration layer for composing or proxying Rails endpoints.
          </p>
          <p className="m-0 max-w-3xl">
            Better Auth is retained as the auth system requested in the scaffold.
            Today it is mounted at <code>/api/auth</code> with email/password
            enabled. Sentry instrumentation is also retained and will activate
            once the Sentry environment values are provided.
          </p>
          <p className="m-0 max-w-3xl">
            The durable project notes live in <code>AGENTS.md</code>, including
            the exact scaffold commands, environment contract, deployment notes,
            and the current list of TanStack Intent skills worth loading when you
            work in this app.
          </p>
        </div>
      </section>
    </main>
  )
}
