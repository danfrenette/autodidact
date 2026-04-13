export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-ad-border bg-ad-base px-4 py-8">
      <div className="mx-auto max-w-6xl text-center text-sm text-ad-text-muted">
        <p>&copy; {year} Autodidact. Self-directed learning tools.</p>
      </div>
    </footer>
  )
}
