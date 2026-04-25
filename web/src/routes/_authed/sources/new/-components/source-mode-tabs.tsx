import { intakeModes } from '../-constants'

import type { IntakeMode } from '../-types'

type SourceModeTabsProps = {
  activeMode: IntakeMode
}

export function SourceModeTabs({ activeMode }: SourceModeTabsProps) {
  return (
    <div className="flex items-center gap-1">
      {intakeModes.map(({ mode, disabled }) => {
        const isActive = mode === activeMode

        return (
          <button
            key={mode}
            type="button"
            disabled={disabled}
            className={[
              'min-h-9 rounded-sm px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors',
              isActive
                ? 'border border-ad-border bg-ad-surface-elevated text-ad-text-heading'
                : 'text-ad-text-muted',
              disabled ? 'cursor-not-allowed opacity-100' : '',
            ].join(' ')}
          >
            {mode}
          </button>
        )
      })}
    </div>
  )
}
