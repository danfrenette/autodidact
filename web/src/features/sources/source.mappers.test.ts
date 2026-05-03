import { describe, expect, it } from 'vitest'
import { buildCreateSourceInput } from './source.mappers'

describe('buildCreateSourceInput', () => {
  it('maps the selected PDF chapters into the Rails source creation contract', () => {
    const input = buildCreateSourceInput(
      {
        file: { name: 'The Pragmatic Programmer.pdf' },
        author: 'Andrew Hunt, David Thomas',
        chapters: [
          { id: '1-foreword', number: 1, title: 'Foreword', page: 13 },
          { id: '2-preface', number: 2, title: 'Preface', page: 17 },
          {
            id: '3-organization',
            number: 3,
            title: 'How the Book Is Organized',
            page: 20,
          },
        ],
      },
      ['1-foreword', '3-organization'],
    )

    expect(input).toEqual({
      title: 'The Pragmatic Programmer',
      kind: 'pdf',
      author: 'Andrew Hunt, David Thomas',
      originalFilename: 'The Pragmatic Programmer.pdf',
      selections: [
        {
          kind: 'chapter',
          title: 'Foreword',
          label: '01',
          position: { ordinal: 1 },
          locator: { type: 'page_range', start: 13, end: 13 },
        },
        {
          kind: 'chapter',
          title: 'How the Book Is Organized',
          label: '03',
          position: { ordinal: 3 },
          locator: { type: 'page_range', start: 20, end: 20 },
        },
      ],
    })
  })
})
