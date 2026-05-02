type ActionBarProps = {
  modelLabel: string
  processLabel: string
  canProcess: boolean
  errorMessage: string | null
  isProcessing: boolean
  onProcess: () => void
}

export function ActionBar({
  modelLabel,
  processLabel,
  canProcess,
  errorMessage,
  isProcessing,
  onProcess,
}: ActionBarProps) {
  return (
    <section className="flex items-end justify-between gap-6 border-t border-ad-border pt-6">
      <div>
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ad-text-secondary">
          Model
        </div>
        <div className="mt-1.5 inline-flex min-h-10 items-center gap-1.5 rounded-sm border border-ad-border bg-ad-surface-elevated px-2.5 text-xs font-medium text-ad-text-secondary">
          <span className="h-3.5 w-3.5 rounded-[2px] bg-ad-border" aria-hidden="true" />
          {modelLabel}
          <span className="text-[11px] text-ad-text-muted">▾</span>
        </div>
      </div>

      {errorMessage ? (
        <div className="min-w-0 flex-1 rounded-sm border border-ad-accent/30 bg-ad-accent-subtle px-4 py-3 text-sm text-ad-accent">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="button"
        disabled={!canProcess || isProcessing}
        onClick={onProcess}
        className="min-h-10 rounded-sm bg-ad-accent px-6 text-sm font-medium text-ad-text-heading transition-colors hover:bg-ad-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isProcessing ? 'Creating Source...' : processLabel}
      </button>
    </section>
  )
}
