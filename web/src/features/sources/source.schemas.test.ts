import { describe, expect, it } from 'vitest'
import { getSourceResponseSchema } from './source.schemas'

describe('getSourceResponseSchema', () => {
  it('parses the Rails source detail contract', () => {
    const result = getSourceResponseSchema.safeParse({
      data: {
        id: '018f3f77-44cb-73d9-b9d5-d293ad30b9a7',
        title:
          'The Pragmatic Programmer Your Journey to Mastery, 20th Anniversary Edition by Andrew Hunt David Hurst Thomas',
        author: 'Andrew Hunt, David Thomas',
        kind: 'pdf',
        originalFilename:
          'The Pragmatic Programmer Your Journey to Mastery, 20th Anniversary Edition by Andrew Hunt David Hurst Thomas.pdf',
        status: 'uploading',
        assetAttached: false,
        selectionCount: 1,
        completedCount: 0,
        progressPercentage: 0,
        createdAt: '2026-05-03T01:54:13Z',
        updatedAt: '2026-05-03T01:54:13Z',
        selections: [
          {
            id: '018f3f77-44cb-7abc-9c0f-8620f30747c4',
            kind: 'chapter',
            title: "It's a Continuous Process",
            label: '12',
            position: { ordinal: 12 },
            locator: { type: 'page_range', start: 33, end: 33 },
            status: 'pending',
          },
        ],
      },
      error: null,
      meta: {},
    })

    expect(result.success).toBe(true)
  })
})
