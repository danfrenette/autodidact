import { createFileRoute, Link } from '@tanstack/react-router'
import { useSources } from '#/features/sources/hooks/use-sources'
import { sourceStatus } from '#/features/sources/source-status'

export const Route = createFileRoute('/_authed/sources/')({
  component: SourcesDashboardPage,
})

const filters = ['All', 'Books', 'Courses', 'Videos', 'Podcasts']

function SourcesDashboardPage() {
  const { data, isLoading } = useSources()
  const sources = data?.data.sources ?? []

  return (
    <div className="flex flex-col gap-8 px-10 py-8">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="font-sans text-xs font-medium uppercase tracking-widest text-ad-text-secondary">
            Dashboard / Sources
          </p>
          <h1 className="font-serif text-4xl font-extrabold uppercase leading-none tracking-tight text-ad-text-heading">
            Your Sources
          </h1>
        </div>
        <Link
          to="/sources/new"
          className="inline-flex items-center justify-center rounded-sm bg-ad-accent px-5 py-2.5 text-sm font-medium text-ad-text-heading transition-colors hover:bg-ad-accent-hover"
        >
          + Add Source
        </Link>
      </div>

      <div className="flex items-center gap-2 border-b border-ad-border pb-2">
        {filters.map((filter, index) => (
          <button
            type="button"
            key={filter}
            className={`inline-flex items-center rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors ${
              index === 0
                ? 'border border-ad-border bg-ad-surface-elevated text-ad-text-heading'
                : 'text-ad-text-secondary hover:text-ad-text-heading'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-0.5">
        {isLoading ? (
          <div className="py-12 text-center text-ad-text-secondary">
            Loading sources...
          </div>
        ) : sources.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-ad-text-secondary">
              No sources yet. Add your first source to get started.
            </p>
            <Link
              to="/sources/new"
              className="inline-flex items-center justify-center rounded-sm bg-ad-accent px-5 py-2.5 text-sm font-medium text-ad-text-heading transition-colors hover:bg-ad-accent-hover"
            >
              Add Source
            </Link>
          </div>
        ) : (
          sources.map((source, index) => {
            const status = sourceStatus(source)

            return (
              <Link
                key={source.id}
                to="/sources/$sourceId"
                params={{ sourceId: source.id }}
                className={`flex items-center gap-4 rounded-sm px-4 py-3.5 transition-colors hover:bg-ad-surface-pressed ${
                  index % 2 === 0 ? 'bg-ad-surface-elevated' : ''
                }`}
              >
                <div
                  className={`shrink-0 size-1.5 rounded-full ${status.dotClassName}`}
                />

                <div className="flex flex-col gap-0.5 grow shrink basis-0">
                  <span className="font-sans text-sm font-medium text-ad-text-heading">
                    {source.title}
                  </span>
                  <span className="font-sans text-xs text-ad-text-secondary">
                    {status.detail ??
                      (source.kind === 'pdf' ? 'Book' : source.kind)}
                  </span>
                </div>

                <span className="w-15 shrink-0 font-mono text-xs uppercase tracking-widest text-ad-text-muted">
                  {source.kind === 'pdf' ? 'BOOK' : source.kind.toUpperCase()}
                </span>

                <span className="w-20 shrink-0 text-right font-mono text-xs text-ad-text-secondary">
                  {status.isFailed
                    ? status.label.toUpperCase()
                    : `Ch. ${source.completedCount} / ${source.selectionCount}`}
                </span>

                <div className="h-1 w-30 shrink-0 rounded-sm bg-ad-border">
                  <div
                    className="h-full rounded-sm bg-ad-accent"
                    style={{ width: `${source.progressPercentage}%` }}
                  />
                </div>

                <span className="w-9 shrink-0 text-right font-mono text-xs text-ad-text-muted">
                  {source.progressPercentage}%
                </span>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
