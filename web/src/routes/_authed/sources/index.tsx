import { createFileRoute, Link } from '@tanstack/react-router'
import { useSources } from '#/features/sources/hooks/use-sources'

export const Route = createFileRoute('/_authed/sources/')({
  component: SourcesDashboardPage,
})

const filters = ['All', 'Books', 'Courses', 'Videos', 'Podcasts']

function SourcesDashboardPage() {
  const { data, isLoading } = useSources()
  const sources = data?.data.sources ?? []

  return (
    <div className="flex flex-col py-8 px-10 gap-8">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1.5">
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-ad-text-secondary">
            Dashboard / Sources
          </p>
          <h1 className="font-serif text-[36px] font-extrabold uppercase leading-none tracking-tight text-ad-text-heading">
            Your Sources
          </h1>
        </div>
        <Link
          to="/sources/new"
          className="inline-flex items-center justify-center rounded-sm bg-ad-accent px-5 py-2.5 text-[13px] font-medium text-ad-text-heading transition-colors hover:bg-ad-accent-hover"
        >
          + Add Source
        </Link>
      </div>

      <div className="flex items-center gap-2 border-b border-ad-ui pb-2">
        {filters.map((filter, index) => (
          <button
            type="button"
            key={filter}
            className={`inline-flex items-center rounded-sm px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors ${
              index === 0
                ? 'bg-ad-surface-secondary text-ad-text-primary border border-ad-ui'
                : 'text-ad-text-secondary hover:text-ad-text-primary'
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
            <p className="text-ad-text-secondary mb-4">
              No sources yet. Add your first source to get started.
            </p>
            <Link
              to="/sources/new"
              className="inline-flex items-center justify-center rounded-sm bg-ad-accent px-5 py-2.5 text-[13px] font-medium text-ad-text-heading transition-colors hover:bg-ad-accent-hover"
            >
              Add Source
            </Link>
          </div>
        ) : (
          sources.map((source, index) => (
            <Link
              key={source.id}
              to="/sources/$sourceId"
              params={{ sourceId: String(source.id) }}
              className={`flex items-center gap-4 rounded-sm py-3.5 px-4 transition-colors hover:bg-ad-surface-pressed ${
                index % 2 === 0 ? 'bg-ad-surface-secondary' : ''
              }`}
            >
              <div
                className={`shrink-0 size-1.5 rounded-full ${
                  source.completedCount === source.selectionCount
                    ? 'bg-ad-text-tertiary'
                    : 'bg-ad-accent'
                }`}
              />

              <div className="flex flex-col gap-0.5 grow shrink basis-0">
                <span className="font-sans text-sm font-medium text-ad-text-primary">
                  {source.title}
                </span>
                <span className="font-sans text-xs text-ad-text-secondary">
                  {source.kind === 'pdf' ? 'Book' : source.kind}
                </span>
              </div>

              <span className="w-15 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-ad-text-tertiary">
                {source.kind === 'pdf' ? 'BOOK' : source.kind.toUpperCase()}
              </span>

              <span className="w-20 shrink-0 text-right font-mono text-[10px] text-ad-text-secondary">
                Ch. {source.completedCount} / {source.selectionCount}
              </span>

              <div className="w-30 h-1 shrink-0 rounded-[1px] bg-ad-ui">
                <div
                  className="h-full rounded-[1px] bg-ad-accent"
                  style={{ width: `${source.progressPercentage}%` }}
                />
              </div>

              <span className="w-9 shrink-0 text-right font-mono text-[11px] text-ad-text-tertiary">
                {source.progressPercentage}%
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
