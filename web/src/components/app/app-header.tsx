import { Link } from '@tanstack/react-router'

export function AppHeader() {
  return (
    <header className="border-b border-ad-border bg-ad-surface/80 px-4 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between py-4">
        <Link to="/" className="font-serif text-xl font-extrabold uppercase tracking-tight text-ad-text-heading">
          Autodidact
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm text-ad-text-muted transition-colors hover:text-ad-text-heading"
            activeProps={{ className: 'text-ad-text-heading' }}
          >
            Home
          </Link>
          <span className="text-sm text-ad-text-muted">Sources</span>
          <span className="text-sm text-ad-text-muted">Review</span>
          <span className="text-sm text-ad-text-muted">Settings</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="rounded border border-ad-border bg-ad-surface-elevated px-3 py-1.5 text-sm text-ad-text-heading transition-colors hover:border-ad-border-hover"
          >
            Sign out
          </Link>
        </div>
      </nav>
    </header>
  )
}
