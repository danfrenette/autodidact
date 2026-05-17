import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import {
  useProviderSettings,
  useSaveProviderCredential,
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
  const settings = useProviderSettings()
  const saveCredential = useSaveProviderCredential()
  const saveRoleSetting = useSaveProviderRoleSetting()
  const [apiKey, setApiKey] = useState('')
  const providers = settings.providers.data?.data.providers ?? []
  const credentials = settings.credentials.data?.data.credentials ?? []
  const roleSettings = settings.roleSettings.data?.data.roleSettings ?? []
  const openaiCredential = credentials.find(
    (credential) => credential.provider === 'openai',
  )

  function saveOpenaiCredential() {
    saveCredential.mutate({ provider: 'openai', apiKey })
  }

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

        <ProviderRoleSection
          providers={providers}
          roleSettings={roleSettings}
          onSave={saveRole}
        />

        <CredentialVault
          apiKey={apiKey}
          credential={openaiCredential}
          errorMessage={saveCredential.error?.message}
          isSaving={saveCredential.isPending}
          onApiKeyChange={setApiKey}
          onSave={saveOpenaiCredential}
        />
      </div>
    </div>
  )
}
