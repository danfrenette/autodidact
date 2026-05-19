import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '#/server/trpc/init'
import { sourceSelectionAnalysisResponseSchema } from '../analysis.schemas'
import {
  createSourceInputSchema,
  getSourceResponseSchema,
  listSourcesResponseSchema,
} from '../source.schemas'
import { getSourceSelectionAnalysisFromRails } from './source-selection-analysis.rails.server'
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
    .input(z.object({ id: z.string().uuid() }))
    .output(getSourceResponseSchema)
    .query(({ ctx, input }) => getSourceFromRails(input.id, ctx.request)),
  create: publicProcedure
    .input(createSourceInputSchema)
    .mutation(({ ctx, input }) => createSourceInRails(input, ctx.request)),
  getSelectionAnalysis: publicProcedure
    .input(z.object({ selectionId: z.string().uuid() }))
    .output(sourceSelectionAnalysisResponseSchema)
    .query(({ ctx, input }) =>
      getSourceSelectionAnalysisFromRails(input.selectionId, ctx.request),
    ),
})
