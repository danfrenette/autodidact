import { z } from 'zod'

export const sourceSelectionInputSchema = z.object({
  kind: z.literal('chapter'),
  title: z.string().min(1),
  label: z.string().min(1),
  position: z.object({ ordinal: z.number().int().positive() }),
  locator: z.object({
    type: z.literal('page_range'),
    start: z.number().int().positive(),
    end: z.number().int().positive(),
  }),
})

export const createSourceInputSchema = z.object({
  title: z.string().min(1),
  kind: z.literal('pdf'),
  originalFilename: z.string().min(1),
  selections: z.array(sourceSelectionInputSchema),
})

export const sourceSchema = z.object({
  id: z.number(),
  title: z.string(),
  kind: z.string(),
  originalFilename: z.string().nullable(),
  status: z.string(),
  assetAttached: z.boolean(),
  selectionCount: z.number(),
  completedCount: z.number(),
  progressPercentage: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const createSourceResponseSchema = z.object({
  data: z.object({
    source: sourceSchema,
  }),
  error: z.null(),
  meta: z.record(z.string(), z.unknown()),
})

export const listSourcesResponseSchema = z.object({
  data: z.object({
    sources: z.array(sourceSchema),
  }),
  error: z.null(),
  meta: z.record(z.string(), z.unknown()),
})

export const railsCsrfResponseSchema = z.object({
  data: z.object({
    csrfToken: z.string(),
  }),
})
