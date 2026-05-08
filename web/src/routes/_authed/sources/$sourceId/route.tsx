import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/sources/$sourceId')({
  component: SourceLayout,
})

function SourceLayout() {
  return <Outlet />
}
