import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'
import type { TagTone } from '../-types'

const toneClasses: Record<TagTone, string> = {
  accent: 'border-ad-chip-strong bg-ad-chip-strong text-ad-chip-accent-text',
  ember:
    'border-ad-chip-accent-border bg-ad-chip-accent text-ad-chip-accent-text',
  muted: 'border-ad-chip-border bg-ad-chip text-ad-chip-text',
}

type TagPillProps = {
  children: ReactNode
  className?: string
  onRemove?: () => void
  removeLabel?: string
  tone?: TagTone
}

export function TagPill({
  children,
  className,
  onRemove,
  removeLabel,
  tone = 'muted',
}: TagPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-xs uppercase',
        toneClasses[tone],
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
