import { createTRPCRouter, publicProcedure } from '#/server/trpc/init'
import { createSourceInputSchema } from '../source.schemas'
import {
  createSourceInRails,
  listSourcesFromRails,
} from './sources.rails.server'

export const sourcesRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => listSourcesFromRails(ctx.request)),
  create: publicProcedure
    .input(createSourceInputSchema)
    .mutation(({ ctx, input }) => createSourceInRails(input, ctx.request)),
})
