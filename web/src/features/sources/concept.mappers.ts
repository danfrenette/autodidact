import { type Concept, conceptSchema } from './concept.schemas'
import type { RailsConcept } from './concept.types'

export function mapRailsConceptToConcept(railsConcept: RailsConcept): Concept {
  return conceptSchema.parse({
    id: railsConcept.id,
    name: railsConcept.name,
    classification: railsConcept.classification,
    definition: railsConcept.definition,
    whyItMatters: railsConcept.why_it_matters,
    createdAt: railsConcept.created_at,
    updatedAt: railsConcept.updated_at,
  })
}

export function mapRailsConceptsToConcepts(
  railsConcepts: RailsConcept[],
): Concept[] {
  return railsConcepts.map(mapRailsConceptToConcept)
}
