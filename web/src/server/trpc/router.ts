import type { TRPCRouterRecord } from '@trpc/server'
import { providersRouter } from '#/features/providers/api/providers.trpc'
import { sourcesRouter } from '#/features/sources/api/sources.trpc'
import { fetchRailsHealthcheck } from '#/lib/rails-api'
import { createTRPCRouter, publicProcedure } from './init'

const appRouter = {
  status: publicProcedure.query(async () => {
    const rails = await fetchRailsHealthcheck()

    return {
      generatedFrom: 'TanStack CLI scaffold',
      packageManager: 'pnpm',
      frontend: {
        framework: 'TanStack Start',
        dataLayer: 'TanStack Query',
        transport: 'tRPC',
      },
      auth: {
        provider: 'Better Auth',
        endpoint: '/api/auth',
        sessionTransport: 'cookie',
      },
      monitoring: {
        provider: 'Sentry',
        configured: Boolean(process.env.VITE_SENTRY_DSN),
      },
      rails,
    }
  }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  app: appRouter,
  providers: providersRouter,
  sources: sourcesRouter,
})
export type TRPCRouter = typeof trpcRouter
