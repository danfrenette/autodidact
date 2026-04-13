import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createContext } from '#/integrations/trpc/init'
import { trpcRouter } from '#/integrations/trpc/router'
import { createFileRoute } from '@tanstack/react-router'

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    createContext: () => createContext(request),
    endpoint: '/api/trpc',
  })
}

export const Route = createFileRoute('/api/trpc/$')({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
})
