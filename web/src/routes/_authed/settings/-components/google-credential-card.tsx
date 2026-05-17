import { GoogleLogo } from '@phosphor-icons/react'
import { useState } from 'react'
import {
  useProviderCredential,
  useSaveProviderCredential,
} from '#/features/providers/hooks/use-provider-settings'
import { ProviderCredentialCard } from './provider-credential-card'

export function GoogleCredentialCard() {
  const [apiKey, setApiKey] = useState('')
  const credentialQuery = useProviderCredential('google')
  const saveCredential = useSaveProviderCredential()

  function save() {
    if (!apiKey) return

    saveCredential.mutate(
      { provider: 'google', apiKey },
      { onSuccess: () => setApiKey('') },
    )
  }

  return (
    <div className="space-y-2">
      <ProviderCredentialCard
        apiKey={apiKey}
        displayKey={credentialQuery.displayKey}
        Icon={GoogleLogo}
        isSaving={saveCredential.isPending}
        name="Google AI Studio"
        onApiKeyChange={setApiKey}
        onSave={save}
        placeholder="AI Studio API key"
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
