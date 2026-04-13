import { GoogleLogo, GithubLogo } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'

type Provider = 'google' | 'github'

interface OAuthButtonProps {
  provider: Provider
  onClick: () => void
  isLoading?: boolean
}

const CONFIG: Record<Provider, { icon: typeof GoogleLogo; label: string }> = {
  google: { icon: GoogleLogo, label: 'Continue with Google' },
  github: { icon: GithubLogo, label: 'Continue with GitHub' },
}

export function OAuthButton({ provider, onClick, isLoading }: OAuthButtonProps) {
  const { icon: Icon, label } = CONFIG[provider]

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={isLoading}
      className="w-full justify-center gap-3"
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ad-border border-t-ad-accent" />
      ) : (
        <Icon size={18} weight="regular" />
      )}
      {isLoading ? 'Connecting...' : label}
    </Button>
  )
}
