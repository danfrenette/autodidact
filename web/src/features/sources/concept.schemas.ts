import { z } from 'zod'

export const conceptClassificationSchema = z.enum([
  'core',
  'supporting',
  'advanced',
])

export type ConceptClassification = z.infer<typeof conceptClassificationSchema>

export const conceptSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  classification: conceptClassificationSchema,
  definition: z.string().nullable(),
  whyItMatters: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Concept = z.infer<typeof conceptSchema>
