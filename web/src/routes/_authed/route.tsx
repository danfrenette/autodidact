import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppSidebar } from '#/components/app/app-sidebar'

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  return (
    <div className="flex min-h-screen bg-ad-base text-ad-text-body">
      <AppSidebar />
      <main className="min-w-0 flex-1 bg-ad-surface">
        <Outlet />
      </main>
    </div>
  )
}
