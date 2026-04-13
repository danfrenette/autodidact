import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppHeader } from '#/components/app/app-header'
import { AppFooter } from '#/components/app/app-footer'

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ad-base">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}
