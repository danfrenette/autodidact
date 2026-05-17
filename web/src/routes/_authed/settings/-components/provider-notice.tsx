type ProviderNoticeProps = {
  show: boolean
}

export function ProviderNotice({ show }: ProviderNoticeProps) {
  if (!show) return null

  return (
    <div className="max-w-2xl rounded-sm border border-ad-accent/40 bg-ad-accent-subtle px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ad-accent">
        <span className="size-1.5 rounded-full bg-ad-accent" />
        Action Required
      </div>
      <p className="mt-2 text-sm leading-5 text-ad-text-body">
        Source creation requires both Embedding and Generation providers.
        Configure both roles below to continue.
      </p>
    </div>
  )
}
