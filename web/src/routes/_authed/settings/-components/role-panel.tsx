import { Select } from '#/components/ui/select'
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
        <Select
          label="Provider"
          value={selectedProvider?.id ?? ''}
          options={providers.map((provider) => ({
            label: provider.displayName,
            value: provider.id,
          }))}
          onValueChange={(value) => {
            const provider = providers.find((item) => item.id === value)
            if (!provider) return
            onSave(
              providerRole,
              provider.id,
              provider.defaultModelsByRole[providerRole],
            )
          }}
        />

        <Select
          label="Model"
          mono
          value={selectedModel ?? ''}
          options={(selectedProvider?.modelsByRole[providerRole] ?? []).map(
            (model) => ({ label: model, value: model }),
          )}
          onValueChange={(value) => {
            if (!selectedProvider) return
            onSave(providerRole, selectedProvider.id, value)
          }}
        />
      </div>

      <p className="text-xs leading-5 text-ad-text-secondary">{description}</p>
    </div>
  )
}
