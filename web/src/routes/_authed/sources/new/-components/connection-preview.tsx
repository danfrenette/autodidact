import type { ConnectionPreviewItem } from '../-types'

type ConnectionPreviewProps = {
  connections: ConnectionPreviewItem[]
}

export function ConnectionPreview({ connections }: ConnectionPreviewProps) {
  return (
    <div className="rounded-sm border border-ad-border px-4 py-3.5">
      <div className="flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-ad-accent" />
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ad-text-secondary">
          Will connect to {connections.length} sources
        </div>
      </div>

      <div className="mt-2.5 space-y-1 pl-3.5">
        {connections.length ? (
          connections.map((connection) => (
            <div
              key={connection.id}
              className="flex flex-wrap items-center gap-2"
            >
              <div className="text-xs font-medium text-ad-text-secondary">
                {connection.title}
              </div>
              <div className="text-[10px] text-ad-text-muted">
                via {connection.matchingTags.join(', ')}
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-ad-text-muted">
            Add tags to preview related sources before processing.
          </div>
        )}
      </div>
    </div>
  )
}
