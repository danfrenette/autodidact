import { z } from 'zod'

const pageRangeLocatorSchema = z.object({
  type: z.literal('page_range'),
  start: z.number().int().positive(),
  end: z.number().int().positive(),
})

export const tagSchema = z.string().min(1)

export const sourceSelectionInputSchema = z.object({
  kind: z.literal('chapter'),
  title: z.string().min(1),
  label: z.string().min(1),
  position: z.object({ ordinal: z.number().int().positive() }),
  locator: pageRangeLocatorSchema,
  tags: z.array(tagSchema),
})

export const createSourceInputSchema = z.object({
  title: z.string().min(1),
  kind: z.literal('pdf'),
  author: z.string().nullable(),
  originalFilename: z.string().min(1),
  signedBlobId: z.string().min(1),
  tags: z.array(tagSchema),
  selections: z.array(sourceSelectionInputSchema),
})

export const sourceSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  author: z.string().nullable(),
  kind: z.string(),
  originalFilename: z.string().nullable(),
  tags: z.array(tagSchema),
  status: z.string(),
  assetAttached: z.boolean(),
  selectionCount: z.number(),
  completedCount: z.number(),
  failedCount: z.number(),
  progressPercentage: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const sourceSelectionSchema = z.object({
  id: z.string().uuid(),
  kind: z.string(),
  title: z.string(),
  label: z.string(),
  position: z.object({ ordinal: z.number() }),
  locator: pageRangeLocatorSchema,
  status: z.string(),
  pipelineStage: z.string().nullable(),
  errorMessage: z.string().nullable(),
  errorDetails: z.record(z.string(), z.unknown()),
  tags: z.array(tagSchema).default([]),
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

const sourceWithSelectionsSchema = sourceSchema.extend({
  selections: z.array(sourceSelectionSchema),
})

export const getSourceResponseSchema = z.object({
  data: sourceWithSelectionsSchema,
  error: z.null(),
  meta: z.record(z.string(), z.unknown()),
})
