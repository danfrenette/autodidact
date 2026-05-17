import { createFileRoute, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import {
  useProviderRoleSettings,
  useProviders,
  useSaveProviderRoleSetting,
} from '#/features/providers/hooks/use-provider-settings'
import type { ProviderRole } from '#/features/providers/provider.types'
import { CredentialVault } from './-components/credential-vault'
import { PageHeader } from './-components/page-header'
import { ProviderNotice } from './-components/provider-notice'
import { ProviderRoleSection } from './-components/provider-role-section'

const searchSchema = z.object({
  notice: z.string().optional(),
})

export const Route = createFileRoute('/_authed/settings/providers')({
  validateSearch: searchSchema,
  component: ProviderSettingsRoute,
})

function ProviderSettingsRoute() {
  const search = useSearch({ from: '/_authed/settings/providers' })
  const providersQuery = useProviders()
  const roleSettingsQuery = useProviderRoleSettings()
  const saveRoleSetting = useSaveProviderRoleSetting()

  function saveRole(role: ProviderRole, provider: string, model: string) {
    saveRoleSetting.mutate({ role, provider, model })
  }

  return (
    <div className="min-h-full px-12 py-8">
      <div className="max-w-ad-page space-y-10">
        <PageHeader
          eyebrow="Settings / Providers"
          title="AI Providers"
          description="Choose the models Autodidact uses to embed source material and generate study output."
        />

        <ProviderNotice show={search.notice === 'providers-required'} />

        {providersQuery.isPending || roleSettingsQuery.isPending ? (
          <p className="text-sm text-ad-text-muted">
            Loading provider settings...
          </p>
        ) : null}

        {providersQuery.error || roleSettingsQuery.error ? (
          <p className="text-sm text-ad-accent">
            {providersQuery.error?.message ?? roleSettingsQuery.error?.message}
          </p>
        ) : null}

        {providersQuery.data && roleSettingsQuery.data ? (
          <ProviderRoleSection
            providers={providersQuery.data.data.providers}
            roleSettings={roleSettingsQuery.data.data.roleSettings}
            onSave={saveRole}
            errorMessage={saveRoleSetting.error?.message}
          />
        ) : null}

        <CredentialVault />
      </div>
    </div>
  )
}
