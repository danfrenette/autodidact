import type {
  ProviderRole,
  ProviderRoleSetting,
} from '#/features/providers/provider.types'

type ProviderOption = {
  id: string
  displayName: string
  modelsByRole: Record<ProviderRole, Array<string>>
  defaultModelsByRole: Record<ProviderRole, string>
}

type RolePanelProps = {
  description: string
  intent: 'primary' | 'secondary'
  onSave: (role: ProviderRole, provider: string, model: string) => void
  providers: Array<ProviderOption>
  providerRole: ProviderRole
  setting?: Pick<ProviderRoleSetting, 'provider' | 'model'>
  title: string
}

export function RolePanel({
  description,
  intent,
  onSave,
  providers,
  providerRole,
  setting,
  title,
}: RolePanelProps) {
  const selectedProvider =
    providers.find((provider) => provider.id === setting?.provider) ??
    providers[0]
  const selectedModel =
    setting?.model ?? selectedProvider?.defaultModelsByRole[providerRole]
  const dotClassName =
    intent === 'primary' ? 'bg-ad-accent' : 'bg-ad-text-heading'

  return (
    <div className="space-y-4 rounded-sm bg-ad-surface-elevated p-4">
      <div className="flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${dotClassName}`} />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ad-text-heading">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-ad-text-secondary">
            Provider
          </span>
          <select
            value={selectedProvider?.id ?? ''}
            onChange={(event) => {
              const provider = providers.find(
                (item) => item.id === event.target.value,
              )
              if (!provider) return
              onSave(
                providerRole,
                provider.id,
                provider.defaultModelsByRole[providerRole],
              )
            }}
            className="min-h-9 w-full rounded-sm border border-ad-border bg-ad-surface px-3 text-sm text-ad-text-body outline-none transition-colors focus:border-ad-border-hover"
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-ad-text-secondary">
            Model
          </span>
          <select
            value={selectedModel ?? ''}
            onChange={(event) => {
              if (!selectedProvider) return
              onSave(providerRole, selectedProvider.id, event.target.value)
            }}
            className="min-h-9 w-full rounded-sm border border-ad-border bg-ad-surface px-3 font-mono text-sm text-ad-text-body outline-none transition-colors focus:border-ad-border-hover"
          >
            {(selectedProvider?.modelsByRole[providerRole] ?? []).map(
              (model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      <p className="text-xs leading-5 text-ad-text-secondary">{description}</p>
    </div>
  )
}
