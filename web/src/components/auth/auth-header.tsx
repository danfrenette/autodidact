import { authClient } from '#/features/auth/client'
import { Link } from '@tanstack/react-router'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="h-8 w-8 bg-ad-surface animate-pulse" />
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img src={session.user.image} alt="" className="h-8 w-8" />
        ) : (
          <div className="h-8 w-8 bg-ad-surface flex items-center justify-center">
            <span className="text-xs font-medium text-ad-text-muted">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            void authClient.signOut()
          }}
          className="flex-1 h-9 px-4 text-sm font-medium bg-ad-surface text-ad-text-body border border-ad-border hover:bg-ad-surface-pressed transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <Link
      to="/auth"
      className="h-9 px-4 text-sm font-medium bg-ad-surface text-ad-text-body border border-ad-border hover:bg-ad-surface-pressed transition-colors inline-flex items-center"
    >
      Sign in
    </Link>
  )
}
