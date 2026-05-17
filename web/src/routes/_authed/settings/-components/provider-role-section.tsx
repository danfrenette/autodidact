import type {
  ProviderRole,
  ProviderRoleSetting,
} from '#/features/providers/provider.types'
import { RolePanel } from './role-panel'

type ProviderDefinition = {
  id: string
  displayName: string
  supportedRoles: Array<ProviderRole>
  modelsByRole: Record<ProviderRole, Array<string>>
  defaultModelsByRole: Record<ProviderRole, string>
}

type ProviderRoleSectionProps = {
  errorMessage?: string
  onSave: (role: ProviderRole, provider: string, model: string) => void
  providers: Array<ProviderDefinition>
  roleSettings: Array<ProviderRoleSetting>
}

export function ProviderRoleSection({
  errorMessage,
  onSave,
  providers,
  roleSettings,
}: ProviderRoleSectionProps) {
  const embeddingSetting = roleSettings.find(
    (setting) => setting.role === 'embedding',
  )
  const generationSetting = roleSettings.find(
    (setting) => setting.role === 'generation',
  )

  return (
    <section className="max-w-2xl space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-ad-text-secondary">
        Role Configuration
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        <RolePanel
          providerRole="embedding"
          title="Embedding"
          intent="primary"
          description="Powers semantic retrieval and source connections. Converts text into vectors for cross-source similarity."
          providers={providers.filter((provider) =>
            provider.supportedRoles.includes('embedding'),
          )}
          setting={embeddingSetting}
          onSave={onSave}
        />
        <RolePanel
          providerRole="generation"
          title="Generation"
          intent="secondary"
          description="Creates Concepts, Questions, Quotes, and Citations. Drives analysis and study output generation."
          providers={providers.filter((provider) =>
            provider.supportedRoles.includes('generation'),
          )}
          setting={generationSetting}
          onSave={onSave}
        />
      </div>
      {errorMessage ? (
        <p className="text-sm text-ad-accent">{errorMessage}</p>
      ) : null}
    </section>
  )
}
