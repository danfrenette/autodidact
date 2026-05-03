import type { z } from 'zod'
import type {
  createSourceInputSchema,
  createSourceResponseSchema,
  getSourceResponseSchema,
  listSourcesResponseSchema,
  sourceSchema,
  sourceSelectionInputSchema,
  sourceSelectionSchema,
} from './source.schemas'

export type SourceSelectionInput = z.infer<typeof sourceSelectionInputSchema>
export type CreateSourceInput = z.infer<typeof createSourceInputSchema>
export type Source = z.infer<typeof sourceSchema>
export type SourceSelection = z.infer<typeof sourceSelectionSchema>
export type CreateSourceResponse = z.infer<typeof createSourceResponseSchema>
export type ListSourcesResponse = z.infer<typeof listSourcesResponseSchema>
export type GetSourceResponse = z.infer<typeof getSourceResponseSchema>

export type SourceIntakeChapter = {
  id: string
  number: number
  title: string
  page: number
}

export type SourceIntakeDocument = {
  file: {
    name: string
  }
  chapters: SourceIntakeChapter[]
}
