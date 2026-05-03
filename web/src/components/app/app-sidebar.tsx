import { Link, useNavigate } from '@tanstack/react-router'

import { authClient } from '#/features/auth/client'

const navigationItems = [
  { label: 'Sources', to: '/sources' },
  { label: 'Knowledge Map', disabled: true },
  { label: 'Review', disabled: true },
  { label: 'Settings', disabled: true },
] as const

export function AppSidebar() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await authClient.signOut()
    await navigate({ to: '/auth' })
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-ad-border bg-ad-sidebar">
      <div className="border-b border-ad-border px-5 py-6">
        <Link to="/sources/new" className="font-serif text-[22px] font-extrabold uppercase tracking-[-0.01em] text-ad-text-heading">
          Autodidact
        </Link>
      </div>

      <nav className="flex flex-1 flex-col px-3 py-4">
        <div className="space-y-0.5">
          {navigationItems.map((item) => {
            if ('disabled' in item) {
              return (
                <div
                  key={item.label}
                  aria-disabled="true"
                  className="flex min-h-11 items-center rounded-sm px-2.5 text-sm text-ad-text-muted"
                >
                  {item.label}
                </div>
              )
            }

            return (
              <Link
                key={item.label}
                to={item.to}
                activeProps={{ className: 'bg-ad-surface-elevated text-ad-text-heading' }}
                className="flex min-h-11 items-center rounded-sm px-2.5 text-sm text-ad-text-secondary transition-colors hover:text-ad-text-heading"
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="mt-auto flex min-h-11 items-center rounded-sm border border-ad-border bg-ad-surface px-3 text-sm text-ad-text-secondary transition-colors hover:border-ad-border-hover hover:text-ad-text-heading"
        >
          Sign out
        </button>
      </nav>
    </aside>
  )
}
