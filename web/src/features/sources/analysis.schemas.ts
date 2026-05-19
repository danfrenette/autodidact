import { z } from 'zod'
import { conceptSchema } from './concept.schemas'
import { sourceSchema, sourceSelectionSchema } from './source.schemas'

export const quoteSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  note: z.string().nullable(),
  position: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const questionSchema = z.object({
  id: z.string().uuid(),
  tier: z.number().int(),
  tierName: z.string(),
  text: z.string(),
  answer: z.string(),
  position: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const sourceSelectionAnalysisResponseSchema = z.object({
  data: z.object({
    selection: sourceSelectionSchema,
    source: sourceSchema,
    concepts: z.array(conceptSchema),
    quotes: z.array(quoteSchema),
    questions: z.array(questionSchema),
  }),
  error: z.null(),
  meta: z.record(z.string(), z.unknown()),
})

export type Quote = z.infer<typeof quoteSchema>
export type Question = z.infer<typeof questionSchema>
export type SourceSelectionAnalysisResponse = z.infer<
  typeof sourceSelectionAnalysisResponseSchema
>
