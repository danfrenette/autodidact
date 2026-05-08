import { describe, expect, it } from 'vitest'
import { mapRailsConceptsToConcepts } from './concept.mappers'
import { railsConceptsResponseSchema } from './concept.schemas'

describe('mapRailsConceptsToConcepts', () => {
  it('maps the Rails concept contract into the web concept contract', () => {
    const railsConcepts = railsConceptsResponseSchema.parse([
      {
        id: '018f3f77-44cb-73d9-b9d5-d293ad30b9a7',
        name: 'Idempotency',
        classification: 'core',
        definition: 'A retry can safely run more than once.',
        why_it_matters: 'It keeps distributed operations predictable.',
        created_at: '2026-05-03T01:54:13Z',
        updated_at: '2026-05-03T01:54:13Z',
      },
    ])

    expect(mapRailsConceptsToConcepts(railsConcepts)).toEqual([
      {
        id: '018f3f77-44cb-73d9-b9d5-d293ad30b9a7',
        name: 'Idempotency',
        classification: 'core',
        definition: 'A retry can safely run more than once.',
        whyItMatters: 'It keeps distributed operations predictable.',
        createdAt: '2026-05-03T01:54:13Z',
        updatedAt: '2026-05-03T01:54:13Z',
      },
    ])
  })
})
