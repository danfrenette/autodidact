import { createFileRoute, Link } from '@tanstack/react-router'
import { useSource } from '#/features/sources/hooks/use-source'
import { formatSourceTitle } from '#/features/sources/source.format'
import { selectionStatus, sourceStatus } from '#/features/sources/source-status'

export const Route = createFileRoute('/_authed/sources/$sourceId/')({
  component: SourceDetailPage,
})

function SourceDetailPage() {
  const { sourceId } = Route.useParams()
  const { data, isLoading, error } = useSource(sourceId)
  const source = data?.data

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-ad-text-secondary">
        Loading source...
      </div>
    )
  }

  if (error || !source) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-ad-text-secondary">
        <p>Failed to load source</p>
        <Link
          to="/sources"
          className="inline-flex items-center justify-center rounded-sm bg-ad-accent px-5 py-2.5 text-sm font-medium text-ad-text-heading transition-colors hover:bg-ad-accent-hover"
        >
          Back to Sources
        </Link>
      </div>
    )
  }

  const status = sourceStatus(source)
  const selections = source.selections ?? []

  return (
    <div className="flex flex-col gap-8 py-8 px-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-widest">
          <span className="text-ad-text-muted">Sources /</span>
          <span
            className="max-w-60 truncate text-ad-text-secondary"
            title={source.title}
          >
            {source.title}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1
              className="truncate font-sans text-4xl font-extrabold uppercase leading-none tracking-tight text-ad-text-heading"
              title={source.title}
            >
              {formatSourceTitle(source.title)}
            </h1>
            {source.author && (
              <p className="truncate font-sans text-sm font-medium text-ad-text-muted">
                {source.author}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${status.dotClassName}`}
              />
              <span
                className={`font-sans text-xs font-medium uppercase tracking-widest ${status.textClassName}`}
              >
                {status.label}
              </span>
            </div>
            <span className="font-mono text-xs text-ad-text-secondary">
              {source.progressPercentage}%
            </span>
          </div>
        </div>

        <div className="h-1 w-full rounded-sm bg-ad-border">
          <div
            className="h-full rounded-sm bg-ad-accent"
            style={{ width: `${source.progressPercentage}%` }}
          />
        </div>
      </div>

      {status.isFailed ? (
        <div className="rounded-sm border border-ad-accent/40 bg-ad-accent/10 px-4 py-3 text-sm text-ad-text-secondary">
          Processing failed for one or more chapters. Open a failed chapter for
          details, then update or switch providers before retrying.
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <h2 className="font-sans text-xs font-medium uppercase tracking-widest text-ad-text-secondary">
          Chapters
        </h2>

        <div className="flex flex-col gap-0.5">
          {selections.map((selection) => {
            const status = selectionStatus(selection)

            return (
              <Link
                key={selection.id}
                to="/sources/$sourceId/selections/$selectionId"
                params={{ sourceId, selectionId: selection.id }}
                className={`flex items-center gap-4 rounded-sm px-4 py-3 transition-colors ${
                  status.isFailed || !status.isComplete
                    ? 'border border-ad-accent bg-ad-surface-elevated'
                    : 'bg-ad-surface-elevated hover:bg-ad-surface'
                }`}
              >
                <span className="w-6 shrink-0 font-mono text-xs text-ad-text-muted">
                  {selection.label}
                </span>

                <span className="flex-1 font-sans text-sm font-medium text-ad-text-secondary">
                  {selection.title}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`size-1.5 rounded-full ${status.dotClassName}`}
                  />
                  <span
                    className={`font-sans text-xs font-medium uppercase tracking-wider ${status.textClassName}`}
                  >
                    {status.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
