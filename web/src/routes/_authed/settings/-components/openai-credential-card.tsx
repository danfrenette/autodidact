import { OpenAiLogo } from '@phosphor-icons/react'
import { useState } from 'react'
import {
  useProviderCredential,
  useSaveProviderCredential,
} from '#/features/providers/hooks/use-provider-settings'
import { ProviderCredentialCard } from './provider-credential-card'

export function OpenAICredentialCard() {
  const [apiKey, setApiKey] = useState('')
  const credentialQuery = useProviderCredential('openai')
  const saveCredential = useSaveProviderCredential()

  function save() {
    if (!apiKey) return

    saveCredential.mutate(
      { provider: 'openai', apiKey },
      { onSuccess: () => setApiKey('') },
    )
  }

  return (
    <div className="space-y-2">
      <ProviderCredentialCard
        apiKey={apiKey}
        displayKey={credentialQuery.displayKey}
        Icon={OpenAiLogo}
        isSaving={saveCredential.isPending}
        name="OpenAI"
        onApiKeyChange={setApiKey}
        onSave={save}
        placeholder="sk-..."
        statusLabel={credentialQuery.statusLabel}
      />
      {credentialQuery.error ? (
        <p className="text-sm text-ad-accent">
          {credentialQuery.error.message}
        </p>
      ) : null}
      {saveCredential.error ? (
        <p className="text-sm text-ad-accent">{saveCredential.error.message}</p>
      ) : null}
    </div>
  )
}
