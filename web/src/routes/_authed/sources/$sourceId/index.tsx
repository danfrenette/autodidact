import { createFileRoute, Link } from '@tanstack/react-router'
import { useSource } from '#/features/sources/hooks/use-source'
import { formatSourceTitle } from '#/features/sources/source.format'

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
          className="inline-flex items-center justify-center rounded-sm bg-ad-accent px-5 py-2.5 text-[13px] font-medium text-ad-text-heading transition-colors hover:bg-ad-accent-hover"
        >
          Back to Sources
        </Link>
      </div>
    )
  }

  const isProcessing = source.status === 'processing'
  const selections = source.selections ?? []

  return (
    <div className="flex flex-col gap-8 py-8 px-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.1em]">
          <span className="text-ad-text-muted">Sources /</span>
          <span className="text-ad-text-secondary">
            {source.kind === 'pdf' ? 'Book' : source.kind}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1
              className="truncate font-sans text-[36px] font-extrabold uppercase leading-none tracking-tight text-ad-text-heading"
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
                className={`size-1.5 rounded-full ${
                  isProcessing ? 'bg-ad-accent' : 'bg-ad-text-secondary'
                }`}
              />
              <span
                className={`font-sans text-[10px] font-medium uppercase tracking-[0.08em] ${
                  isProcessing ? 'text-ad-accent' : 'text-ad-text-secondary'
                }`}
              >
                {isProcessing ? 'Processing' : 'Complete'}
              </span>
            </div>
            <span className="font-mono text-[11px] text-ad-text-secondary">
              {source.progressPercentage}%
            </span>
          </div>
        </div>

        <div className="h-[3px] w-full rounded-[1px] bg-ad-border">
          <div
            className="h-full rounded-[1px] bg-ad-accent"
            style={{ width: `${source.progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ad-text-secondary">
          Chapters
        </h2>

        <div className="flex flex-col gap-0.5">
          {selections.map((selection) => {
            const isComplete = selection.status === 'complete'
            const isActive = selection.status === 'processing'

            return (
              <Link
                key={selection.id}
                to="/sources/$sourceId/selections/$selectionId"
                params={{ sourceId, selectionId: selection.id }}
                className={`flex items-center gap-4 rounded-[2px] px-4 py-3 transition-colors ${
                  isActive
                    ? 'border border-ad-accent bg-ad-surface-elevated'
                    : 'bg-ad-surface-elevated hover:bg-ad-surface'
                }`}
              >
                <span className="w-6 shrink-0 font-mono text-[11px] text-ad-text-muted">
                  {selection.label}
                </span>

                <span className="flex-1 font-sans text-sm font-medium text-ad-text-secondary">
                  {selection.title}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`size-1.5 rounded-full ${isComplete ? 'bg-ad-text-secondary' : 'bg-ad-accent'}`}
                  />
                  <span
                    className={`font-sans text-[10px] font-medium uppercase tracking-[0.06em] ${isComplete ? 'text-ad-text-muted' : 'text-ad-accent'}`}
                  >
                    {isComplete ? 'Complete' : 'Processing'}
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
