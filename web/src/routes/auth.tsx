import { useState, useId } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'

// =============================================================================
// ICONS (colocated - only used here)
// =============================================================================

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function RegistrationMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="10" y1="0" x2="10" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="0" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

// =============================================================================
// CONSTELLATION VISUALIZATION
// =============================================================================

interface NodeConfig {
  id: number
  cx: number
  cy: number
  r: number
  isPulsing?: boolean
}

interface EdgeConfig {
  id: number
  x1: number
  y1: number
  x2: number
  y2: number
}

const CONSTELLATION_NODES: NodeConfig[] = [
  { id: 1, cx: 120, cy: 80, r: 4 },
  { id: 2, cx: 280, cy: 60, r: 5 },
  { id: 3, cx: 400, cy: 120, r: 6, isPulsing: true },
  { id: 4, cx: 180, cy: 180, r: 4 },
  { id: 5, cx: 320, cy: 200, r: 3.5 },
  { id: 6, cx: 80, cy: 240, r: 5 },
  { id: 7, cx: 220, cy: 280, r: 4 },
  { id: 8, cx: 360, cy: 260, r: 3 },
  { id: 9, cx: 140, cy: 340, r: 3.5 },
  { id: 10, cx: 300, cy: 340, r: 4 },
  { id: 11, cx: 440, cy: 180, r: 3 },
  { id: 12, cx: 60, cy: 140, r: 3 },
  { id: 13, cx: 480, cy: 100, r: 4 },
  { id: 14, cx: 420, cy: 300, r: 3.5 },
  { id: 15, cx: 200, cy: 400, r: 3 },
  { id: 16, cx: 380, cy: 380, r: 14, isPulsing: true },
  { id: 17, cx: 100, cy: 360, r: 3 },
  { id: 18, cx: 460, cy: 240, r: 8 },
]

const CONSTELLATION_EDGES: EdgeConfig[] = [
  { id: 1, x1: 120, y1: 80, x2: 280, y2: 60 },
  { id: 2, x1: 280, y1: 60, x2: 400, y2: 120 },
  { id: 3, x1: 120, y1: 80, x2: 180, y2: 180 },
  { id: 4, x1: 180, y1: 180, x2: 320, y2: 200 },
  { id: 5, x1: 320, y1: 200, x2: 400, y2: 120 },
  { id: 6, x1: 180, y1: 180, x2: 80, y2: 240 },
  { id: 7, x1: 80, y1: 240, x2: 220, y2: 280 },
  { id: 8, x1: 220, y1: 280, x2: 320, y2: 200 },
  { id: 9, x1: 220, y1: 280, x2: 140, y2: 340 },
  { id: 10, x1: 220, y1: 280, x2: 300, y2: 340 },
  { id: 11, x1: 400, y1: 120, x2: 440, y2: 180 },
  { id: 12, x1: 320, y1: 200, x2: 360, y2: 260 },
  { id: 13, x1: 360, y1: 260, x2: 440, y2: 180 },
  { id: 14, x1: 80, y1: 240, x2: 60, y2: 140 },
  { id: 15, x1: 60, y1: 140, x2: 120, y2: 80 },
  { id: 16, x1: 400, y1: 120, x2: 480, y2: 100 },
  { id: 17, x1: 360, y1: 260, x2: 420, y2: 300 },
  { id: 18, x1: 300, y1: 340, x2: 420, y2: 300 },
  { id: 19, x1: 140, y1: 340, x2: 200, y2: 400 },
  { id: 20, x1: 300, y1: 340, x2: 380, y2: 380 },
  { id: 21, x1: 440, y1: 180, x2: 480, y2: 100 },
  { id: 22, x1: 440, y1: 180, x2: 460, y2: 240 },
  { id: 23, x1: 420, y1: 300, x2: 460, y2: 240 },
  { id: 24, x1: 100, y1: 360, x2: 140, y2: 340 },
]

function ConstellationField() {
  return (
    <div className="relative w-full max-w-[640px]">
      <svg
        viewBox="0 0 560 440"
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Edges */}
        {CONSTELLATION_EDGES.map((edge) => (
          <line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="#1a1a1e"
            strokeWidth="1"
          />
        ))}

        {/* Nodes */}
        {CONSTELLATION_NODES.map((node) => (
          <circle
            key={node.id}
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill={node.isPulsing ? '#c8352e' : '#2a2a30'}
            className={node.isPulsing ? 'animate-pulse' : ''}
          />
        ))}
      </svg>
    </div>
  )
}

// =============================================================================
// BOOT SEQUENCE
// =============================================================================

interface BootRowProps {
  label: string
  status: string
  isRequired?: boolean
}

function BootRow({ label, status, isRequired }: BootRowProps) {
  const statusColor = isRequired ? 'text-[#c8352e]' : 'text-[#a0a0a8]'

  return (
    <div className="flex items-center gap-3 font-mono text-[11px] tracking-wider">
      <span className="whitespace-nowrap text-[#a0a0a8]">{label}</span>
      <span className="flex-1 border-b border-dotted border-[#2a2a30]" />
      <span className={`whitespace-nowrap ${statusColor}`}>{status}</span>
    </div>
  )
}

// =============================================================================
// AUTH PANEL COMPONENTS
// =============================================================================

type AuthTab = 'signin' | 'signup'

interface AuthTabsProps {
  activeTab: AuthTab
  onTabChange: (tab: AuthTab) => void
}

function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
  const baseClasses = 'px-8 py-3 text-[13px] uppercase tracking-wider transition-colors'
  const activeClasses = 'border-b-2 border-[#c8352e] font-semibold text-[#e8e8ec]'
  const inactiveClasses = 'border-b-2 border-transparent font-medium text-[#64646c] hover:text-[#a0a0a8]'

  return (
    <div className="flex border-b border-[#2a2a30]">
      <button
        type="button"
        onClick={() => onTabChange('signin')}
        className={`${baseClasses} ${activeTab === 'signin' ? activeClasses : inactiveClasses}`}
        aria-pressed={activeTab === 'signin'}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onTabChange('signup')}
        className={`${baseClasses} ${activeTab === 'signup' ? activeClasses : inactiveClasses}`}
        aria-pressed={activeTab === 'signup'}
      >
        Sign Up
      </button>
    </div>
  )
}

interface OAuthButtonProps {
  provider: 'google' | 'github'
  onClick: () => void
  isLoading?: boolean
}

function OAuthButton({ provider, onClick, isLoading }: OAuthButtonProps) {
  const providerConfig = {
    google: {
      icon: GoogleIcon,
      label: 'Continue with Google',
    },
    github: {
      icon: GitHubIcon,
      label: 'Continue with GitHub',
    },
  }

  const { icon: Icon, label } = providerConfig[provider]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded border border-[#2a2a30] bg-[#1a1a1e] px-4 py-3.5 text-[14px] font-medium text-[#e8e8ec] transition-colors hover:border-[#64646c] hover:bg-[#232328] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2a2a30] border-t-[#c8352e]" />
      ) : (
        <Icon className="h-[18px] w-[18px]" />
      )}
      {isLoading ? 'Connecting...' : label}
    </button>
  )
}

// =============================================================================
// AUTH ERROR BOUNDARY (Vercel best practice: handle errors gracefully)
// =============================================================================

class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0e0e11]">
          <div className="rounded border border-[#2a2a30] bg-[#131316] p-8 text-center">
            <p className="mb-2 text-[#c8352e] font-mono text-sm">SYSTEM ERROR</p>
            <p className="text-[#a0a0a8]">Authentication interface failed to load.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-[#e8e8ec] hover:text-[#c8352e] transition-colors"
            >
              Reload Terminal
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Need to import React for the class component
import * as React from 'react'

// =============================================================================
// MAIN AUTH PAGE
// =============================================================================

function AuthPage() {
  const { data: session, isPending } = authClient.useSession()
  const [activeTab, setActiveTab] = useState<AuthTab>('signin')
  const [isLoading, setIsLoading] = useState<null | 'google' | 'github'>(null)
  const [error, setError] = useState<string | null>(null)

  // Unique IDs for accessibility
  const panelId = useId()
  const errorId = useId()

  // Loading state: show minimal spinner (Vercel: defer non-critical UI)
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e0e11]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2a2a30] border-t-[#c8352e]" />
      </div>
    )
  }

  // Authenticated: show session info with sign out
  if (session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e0e11] px-4">
        <div className="w-full max-w-md rounded border border-[#2a2a30] bg-[#131316] p-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#64646c]">
            OPERATOR AUTHENTICATED
          </p>
          <h1 className="font-serif text-2xl font-extrabold uppercase tracking-tight text-[#e8e8ec]">
            Session Active
          </h1>
          <p className="mt-3 text-[14px] text-[#a0a0a8]">
            You are currently signed in as {session.user.email}.
          </p>

          <div className="mt-6 flex items-center gap-4 rounded border border-[#2a2a30] bg-[#1a1a1e] p-4">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt=""
                className="h-12 w-12 rounded-full"
                loading="lazy"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a2a30] text-[#e8e8ec] font-semibold">
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-[#e8e8ec]">
                {session.user.name || 'Unnamed user'}
              </p>
              <p className="truncate text-sm text-[#64646c]">
                {session.user.email}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              to="/"
              className="flex-1 rounded border border-[#2a2a30] bg-[#1a1a1e] px-4 py-2.5 text-center text-sm font-medium text-[#e8e8ec] transition-colors hover:border-[#64646c] hover:bg-[#232328]"
            >
              Go to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => void authClient.signOut()}
              className="rounded border border-[#c8352e]/30 bg-[#c8352e]/10 px-4 py-2.5 text-sm font-medium text-[#c8352e] transition-colors hover:bg-[#c8352e]/20"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle OAuth sign in
  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(provider)
    setError(null)

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: '/',
      })

      if (result.error) {
        setError(result.error.message || `${provider} authentication failed`)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  const tabDescription = activeTab === 'signin'
    ? 'Sign in with your existing account to resume your session.'
    : 'Create a new account to get started.'

  return (
    <AuthErrorBoundary>
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* =================================================================
            LEFT HALF — Brand Atmosphere
            ================================================================= */}
        <div className="relative flex flex-1 flex-col bg-[#0e0e11] p-6 lg:p-12">
          {/* Grid Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e8e8ec 1px, transparent 1px),
                linear-gradient(to bottom, #e8e8ec 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Registration Marks */}
          <RegistrationMark className="absolute left-6 top-6 h-5 w-5 text-[#2a2a30] lg:left-12 lg:top-12" />
          <RegistrationMark className="absolute bottom-6 left-6 h-5 w-5 text-[#2a2a30] lg:bottom-12 lg:left-12" />

          {/* Content */}
          <div className="relative z-10 flex flex-1 flex-col">
            {/* Wordmark */}
            <div className="mb-auto pt-8 lg:pt-16">
              <h1 className="font-serif text-[40px] font-extrabold uppercase leading-none tracking-tight text-[#e8e8ec] lg:text-[52px]">
                Autodidact
              </h1>
              <p className="mt-4 max-w-[360px] text-[15px] leading-relaxed text-[#64646c]">
                Turn scattered sources into structured knowledge. Books, courses, videos, podcasts — connected and retained.
              </p>
            </div>

            {/* Constellation Field */}
            <div className="my-8 flex items-center justify-center lg:my-auto">
              <ConstellationField />
            </div>

            {/* Boot Sequence */}
            <div className="mb-8 mt-auto w-full max-w-[600px] space-y-3 lg:mb-0">
              <BootRow label="KNOWLEDGE BASE" status="STANDBY" />
              <BootRow label="RETENTION ENGINE" status="STANDBY" />
              <BootRow label="ANALYSIS PIPELINE" status="STANDBY" />
              <BootRow label="CONNECTION GRAPH" status="STANDBY" />
              <BootRow label="OPERATOR AUTH" status="REQUIRED" isRequired />
            </div>
          </div>
        </div>

        {/* =================================================================
            RIGHT HALF — Auth Panel
            ================================================================= */}
        <div className="relative flex items-center justify-center border-t border-[#2a2a30] bg-[#131316] p-6 lg:w-[680px] lg:border-l lg:border-t-0">
          <div id={panelId} className="w-full max-w-[380px]">
            {/* Tabs */}
            <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Header */}
            <div className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#64646c]">
                OPERATOR AUTHENTICATION
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[#a0a0a8]">
                {tabDescription}
              </p>
            </div>

            {/* Error Display */}
            {error ? (
              <div
                id={errorId}
                role="alert"
                className="mt-6 rounded border border-[#c8352e]/30 bg-[#c8352e]/10 px-4 py-3"
              >
                <p className="text-sm text-[#c8352e]">{error}</p>
              </div>
            ) : null}

            {/* OAuth Buttons */}
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

            {/* Terms */}
            <p className="mt-8 text-center text-[12px] text-[#64646c]">
              By continuing, you agree to the{' '}
              <a href="#" className="text-[#a0a0a8] underline-offset-2 hover:text-[#e8e8ec]">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </div>
    </AuthErrorBoundary>
  )
}

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================

export const Route = createFileRoute('/auth')({
  component: AuthPage,
  // If user already has a session, we could redirect, but showing the
  // session card is a better UX — lets them know they're signed in
  beforeLoad: async () => {
    // This runs on both server and client - we don't check auth here
    // because authClient.useSession() handles that in the component
  },
})
