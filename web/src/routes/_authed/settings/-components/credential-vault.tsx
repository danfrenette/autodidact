import type { ProviderCredential } from '#/features/providers/provider.types'

type CredentialVaultProps = {
  apiKey: string
  credential?: ProviderCredential
  errorMessage?: string
  isSaving: boolean
  onApiKeyChange: (value: string) => void
  onSave: () => void
}

export function CredentialVault({
  apiKey,
  credential,
  errorMessage,
  isSaving,
  onApiKeyChange,
  onSave,
}: CredentialVaultProps) {
  return (
    <section className="max-w-2xl space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-ad-text-secondary">
        Credential Vault
      </h2>

      <div className="flex flex-col gap-4 rounded-sm bg-ad-surface-elevated px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-ad-border text-xs font-bold uppercase text-ad-text-body">
            O
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-ad-text-heading">
              OpenAI
              <span className="size-1.5 rounded-full bg-ad-text-secondary" />
              <span className="text-xs font-normal text-ad-text-muted">
                {credential?.status === 'connected'
                  ? 'Connected'
                  : 'Not connected'}
              </span>
            </div>
            <div className="font-mono text-sm tracking-wide text-ad-text-muted">
              {credential?.displayKey ?? 'No key saved'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(event) => onApiKeyChange(event.target.value)}
            placeholder="sk-..."
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

      {errorMessage ? (
        <p className="text-sm text-ad-accent">{errorMessage}</p>
      ) : null}
    </section>
  )
}
