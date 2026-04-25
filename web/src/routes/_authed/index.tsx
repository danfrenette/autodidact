import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex min-h-full items-center px-12 py-10">
      <div className="max-w-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ad-text-secondary">
          Sources Workspace
        </p>
        <h1 className="mt-3 font-serif text-[40px] font-extrabold uppercase leading-none tracking-tight text-ad-text-heading">
          Start with a source.
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-6 text-ad-text-muted">
          Import a PDF, choose the chapters worth processing, and connect it to the rest of your knowledge graph.
        </p>
        <Link
          to="/sources/new"
          className="mt-8 inline-flex min-h-11 items-center rounded-sm bg-ad-accent px-6 text-sm font-medium text-ad-text-heading transition-colors hover:bg-ad-accent-hover"
        >
          Add Source
        </Link>
      </div>
    </div>
  )
}
