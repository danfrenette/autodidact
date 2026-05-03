import { createFileRoute, Link } from '@tanstack/react-router'
import { useSource } from '#/features/sources/hooks/use-source'

export const Route = createFileRoute('/_authed/sources/$sourceId')({
  component: SourceDetailPage,
})

function SourceDetailPage() {
  const { sourceId } = Route.useParams()
  const id = Number.parseInt(sourceId, 10)
  const { data, isLoading, error } = useSource(id)
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
      {/* Header Section */}
      <div className="flex flex-col gap-4 border-b border-ad-ui pb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.1em]">
          <span className="text-ad-text-secondary">Sources /</span>
          <span className="text-ad-text-tertiary">
            {source.kind === 'pdf' ? 'Book' : source.kind}
          </span>
        </div>

        {/* Title Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-[36px] font-extrabold uppercase leading-none tracking-tight text-ad-text-heading">
              {source.title}
            </h1>
            {source.originalFilename && (
              <p className="font-sans text-sm text-ad-text-secondary">
                {source.originalFilename.replace(/\.pdf$/i, '')}
              </p>
            )}
          </div>

          {/* Status + Progress */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${
                  isProcessing ? 'bg-ad-accent' : 'bg-ad-text-tertiary'
                }`}
              />
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.08em] ${
                  isProcessing ? 'text-ad-accent' : 'text-ad-text-tertiary'
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

        {/* Progress Bar */}
        <div className="h-[3px] w-full rounded-[1px] bg-ad-ui">
          <div
            className="h-full rounded-[1px] bg-ad-accent"
            style={{ width: `${source.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Chapters Section */}
      <div className="flex flex-col gap-4">
        <h2 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-ad-text-secondary">
          Chapters
        </h2>

        <div className="flex flex-col gap-0.5">
          {selections.map((selection) => {
            const isComplete = selection.status === 'complete'
            const isActive = selection.status === 'processing'

            return (
              <div
                key={selection.id}
                className={`flex items-center gap-4 rounded-[2px] px-4 py-3 ${
                  isActive
                    ? 'border border-ad-accent bg-ad-surface-secondary'
                    : 'bg-ad-surface-secondary'
                }`}
              >
                {/* Chapter Number */}
                <span className="w-6 shrink-0 font-mono text-[11px] text-ad-text-tertiary">
                  {selection.label}
                </span>

                {/* Chapter Title */}
                <span className="flex-1 font-sans text-sm font-medium text-ad-text-primary">
                  {selection.title}
                </span>

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`size-1.5 rounded-full ${
                      isComplete ? 'bg-ad-text-tertiary' : 'bg-ad-accent'
                    }`}
                  />
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.08em] ${
                      isComplete ? 'text-ad-text-tertiary' : 'text-ad-accent'
                    }`}
                  >
                    {isComplete ? 'Complete' : 'Processing'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
