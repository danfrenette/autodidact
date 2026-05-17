import type { Icon } from '@phosphor-icons/react'

type ProviderCredentialCardProps = {
  apiKey: string
  displayKey: string
  Icon: Icon
  isSaving: boolean
  name: string
  onApiKeyChange: (value: string) => void
  onSave: () => void
  placeholder: string
  statusLabel: string
}

export function ProviderCredentialCard({
  apiKey,
  displayKey,
  Icon,
  isSaving,
  name,
  onApiKeyChange,
  onSave,
  placeholder,
  statusLabel,
}: ProviderCredentialCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-sm bg-ad-surface-elevated px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-ad-border text-xs font-bold uppercase text-ad-text-body">
          <Icon size={18} weight="regular" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-ad-text-heading">
            {name}
            <span className="size-1.5 rounded-full bg-ad-text-secondary" />
            <span className="text-xs font-normal text-ad-text-muted">
              {statusLabel}
            </span>
          </div>
          <div className="font-mono text-sm tracking-wide text-ad-text-muted">
            {displayKey}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(event) => onApiKeyChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-9 w-56 rounded-sm border border-ad-border bg-ad-surface px-3 font-mono text-sm text-ad-text-body outline-none transition-colors placeholder:text-ad-text-muted focus:border-ad-border-hover"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={!apiKey || isSaving}
          className="min-h-9 rounded-sm bg-ad-border px-3 text-xs font-medium text-ad-text-body transition-colors hover:bg-ad-surface-pressed disabled:cursor-not-allowed disabled:opacity-50"
        >
          Verify & Save
        </button>
      </div>
    </div>
  )
}
