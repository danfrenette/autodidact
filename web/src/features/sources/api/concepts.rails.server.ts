import { requestRails } from '#/lib/rails-api'
import { validate } from '#/lib/validation'
import { mapRailsConceptsToConcepts } from '../concept.mappers'
import { railsConceptsResponseSchema } from '../concept.schemas'
import type { Concept } from '../concept.types'

export async function getConceptsFromRails(
  selectionId: string,
  request: Request,
): Promise<Concept[]> {
  const payload = await requestRails(
    `/source_selections/${selectionId}/concepts`,
    { method: 'GET' },
    { request },
  )

  const railsConcepts = validate(
    railsConceptsResponseSchema,
    payload,
    `getConcepts(${selectionId})`,
  )

  return mapRailsConceptsToConcepts(railsConcepts)
}
