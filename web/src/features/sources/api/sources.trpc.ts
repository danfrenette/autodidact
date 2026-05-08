import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '#/server/trpc/init'
import { conceptsResponseSchema } from '../concept.schemas'
import {
  createSourceInputSchema,
  getSourceResponseSchema,
  listSourcesResponseSchema,
} from '../source.schemas'
import { getConceptsFromRails } from './concepts.rails.server'
import {
  createSourceInRails,
  getSourceFromRails,
  listSourcesFromRails,
} from './sources.rails.server'

export const sourcesRouter = createTRPCRouter({
  list: publicProcedure
    .output(listSourcesResponseSchema)
    .query(({ ctx }) => listSourcesFromRails(ctx.request)),
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .output(getSourceResponseSchema)
    .query(({ ctx, input }) => getSourceFromRails(input.id, ctx.request)),
  create: publicProcedure
    .input(createSourceInputSchema)
    .mutation(({ ctx, input }) => createSourceInRails(input, ctx.request)),
  getConcepts: publicProcedure
    .input(z.object({ selectionId: z.number() }))
    .output(conceptsResponseSchema)
    .query(({ ctx, input }) =>
      getConceptsFromRails(input.selectionId, ctx.request),
    ),
})
