import { initTRPC } from '@trpc/server'
import superjson from 'superjson'

export interface TRPCContext {
  request: Request
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

export function createContext(request: Request): TRPCContext {
  return { request }
}
