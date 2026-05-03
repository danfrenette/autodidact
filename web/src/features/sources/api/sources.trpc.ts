import { createTRPCRouter, publicProcedure } from '#/server/trpc/init'
import { createSourceInputSchema } from '../source.schemas'
import { createSourceInRails } from './sources.rails.server'

export const sourcesRouter = createTRPCRouter({
  create: publicProcedure
    .input(createSourceInputSchema)
    .mutation(({ ctx, input }) => createSourceInRails(input, ctx.request)),
})
