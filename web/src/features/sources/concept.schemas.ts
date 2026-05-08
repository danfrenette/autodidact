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

export const conceptsResponseSchema = z.array(conceptSchema)

export type ConceptsResponse = z.infer<typeof conceptsResponseSchema>

export const railsConceptSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  classification: conceptClassificationSchema,
  definition: z.string().nullable(),
  why_it_matters: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const railsConceptsResponseSchema = z.array(railsConceptSchema)

export type RailsConcept = z.infer<typeof railsConceptSchema>
