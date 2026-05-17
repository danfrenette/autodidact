import { GoogleCredentialCard } from './google-credential-card'
import { OpenAICredentialCard } from './openai-credential-card'

export function CredentialVault() {
  return (
    <section className="max-w-2xl space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-ad-text-secondary">
        Credential Vault
      </h2>

      <div className="space-y-3">
        <OpenAICredentialCard />
        <GoogleCredentialCard />
      </div>
    </section>
  )
}
