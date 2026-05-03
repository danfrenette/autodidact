import { createFileRoute, Link } from '@tanstack/react-router'
import { useId, useState } from 'react'
import { authClient } from '#/features/auth/client'
import { AuthTabs } from './-components/auth-tabs'
import { BootRow } from './-components/boot-row'
import { ConstellationField } from './-components/constellation'
import { OAuthButton } from './-components/oauth-button'
import { RegistrationMark } from './-icons'

function AuthPage() {
  const { data: session, isPending, refetch } = authClient.useSession()
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [isLoading, setIsLoading] = useState<null | 'google' | 'github'>(null)
  const [error, setError] = useState<string | null>(null)

  const errorId = useId()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ad-base">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ad-border border-t-ad-accent" />
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ad-base px-4">
        <div className="w-full max-w-md rounded border border-ad-border bg-ad-surface p-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-ad-text-muted">
            OPERATOR AUTHENTICATED
          </p>
          <h1 className="font-serif text-2xl font-extrabold uppercase tracking-tight text-ad-text-heading">
            Session Active
          </h1>
          <p className="mt-3 text-[14px] text-ad-text-secondary">
            Signed in as {session.user.email}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/sources/new"
              className="flex-1 rounded border border-ad-border bg-ad-surface-elevated px-4 py-2.5 text-center text-sm font-medium text-ad-text-heading transition-colors hover:border-ad-border-hover hover:bg-ad-surface-pressed"
            >
              Go to Dashboard
            </Link>
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut()
                await refetch()
              }}
              className="rounded border border-ad-accent/30 bg-ad-accent-subtle px-4 py-2.5 text-sm font-medium text-ad-accent transition-colors hover:bg-ad-accent/20"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(provider)
    setError(null)
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: '/sources/new',
      })
      if (result.error)
        setError(result.error.message || 'Authentication failed')
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  const description =
    activeTab === 'signin'
      ? 'Sign in with your existing account to resume your session.'
      : 'Create a new account to get started.'

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative flex flex-1 flex-col bg-ad-base p-6 lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, var(--ad-text-heading) 1px, transparent 1px), linear-gradient(to bottom, var(--ad-text-heading) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <RegistrationMark className="absolute left-6 top-6 lg:left-12 lg:top-12" />
        <RegistrationMark className="absolute bottom-6 left-6 lg:bottom-12 lg:left-12" />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-auto pt-8 lg:pt-16">
            <h1 className="font-serif text-[40px] font-extrabold uppercase leading-none tracking-tight text-ad-text-heading lg:text-[52px]">
              Autodidact
            </h1>
            <p className="mt-4 max-w-[360px] text-[15px] leading-relaxed text-ad-text-muted">
              Turn scattered sources into structured knowledge. Books, courses,
              videos, podcasts — connected and retained.
            </p>
          </div>

          <div className="my-8 flex items-center justify-center lg:my-auto">
            <ConstellationField />
          </div>

          <div className="mb-8 mt-auto w-full max-w-[600px] space-y-3 lg:mb-0">
            <BootRow label="KNOWLEDGE BASE" status="STANDBY" />
            <BootRow label="RETENTION ENGINE" status="STANDBY" />
            <BootRow label="ANALYSIS PIPELINE" status="STANDBY" />
            <BootRow label="CONNECTION GRAPH" status="STANDBY" />
            <BootRow label="OPERATOR AUTH" status="REQUIRED" isRequired />
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center border-t border-ad-border bg-ad-surface p-6 lg:w-[680px] lg:border-l lg:border-t-0">
        <div className="w-full max-w-[380px]">
          <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="mt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ad-text-muted">
              OPERATOR AUTHENTICATION
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-ad-text-secondary">
              {description}
            </p>
          </div>

          {error && (
            <div
              id={errorId}
              role="alert"
              className="mt-6 rounded border border-ad-accent/30 bg-ad-accent-subtle px-4 py-3"
            >
              <p className="text-sm text-ad-accent">{error}</p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <OAuthButton
              provider="github"
              onClick={() => handleOAuthSignIn('github')}
              isLoading={isLoading === 'github'}
            />
            <OAuthButton
              provider="google"
              onClick={() => handleOAuthSignIn('google')}
              isLoading={isLoading === 'google'}
            />
          </div>

          <p className="mt-8 text-center text-[12px] text-ad-text-muted">
            By continuing, you agree to the{' '}
            <a
              href="#"
              className="text-ad-text-secondary hover:text-ad-text-heading"
            >
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})
