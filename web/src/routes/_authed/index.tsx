import { createFileRoute } from '@tanstack/react-router'

/**
 * Protected Home Page
 *
 * The main landing page for authenticated users.
 * Currently a simple "Hello world" placeholder.
 */
export const Route = createFileRoute('/_authed/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-extrabold uppercase tracking-tight text-ad-text-heading">
          Hello world
        </h1>
        <p className="mt-4 text-ad-text-muted">
          Welcome to Autodidact. Start by adding your first source.
        </p>
      </div>
    </div>
  )
}
