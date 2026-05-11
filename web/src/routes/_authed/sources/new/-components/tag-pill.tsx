import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'

type TagPillProps = {
  children: ReactNode
  className?: string
  onRemove?: () => void
  removeLabel?: string
}

export function TagPill({
  children,
  className,
  onRemove,
  removeLabel,
}: TagPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border border-ad-border bg-[#1e1e24] px-2 py-1 font-mono text-[11px] uppercase text-ad-text-primary',
        className,
      )}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="text-ad-text-muted transition-colors hover:text-ad-text-heading"
          aria-label={removeLabel}
        >
          ×
        </button>
      ) : null}
    </span>
  )
}
