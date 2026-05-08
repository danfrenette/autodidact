import { type Concept, conceptSchema } from './concept.schemas'
import type { RailsConcept } from './source.types'

export function mapRailsConceptToConcept(railsConcept: RailsConcept): Concept {
  return conceptSchema.parse({
    id: railsConcept.id,
    name: railsConcept.name,
    classification: railsConcept.classification,
    definition: railsConcept.definition,
    why_it_matters: railsConcept.why_it_matters,
    created_at: railsConcept.created_at,
    updated_at: railsConcept.updated_at,
  })
}

export function mapRailsConceptsToConcepts(
  railsConcepts: RailsConcept[],
): Concept[] {
  return railsConcepts.map(mapRailsConceptToConcept)
}
