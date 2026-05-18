import { describe, expect, it } from 'vitest'
import type { Source, SourceSelection } from './source.types'
import { selectionStatus, sourceStatus } from './source-status'

describe('sourceStatus', () => {
  it('treats failed sources as complete but failed', () => {
    expect(
      sourceStatus(
        source({ status: 'failed', completedCount: 1, failedCount: 1 }),
      ),
    ).toMatchObject({ isComplete: true, isFailed: true, label: 'Failed' })
  })

  it('treats fully processed sources as complete', () => {
    expect(sourceStatus(source({ completedCount: 2 }))).toMatchObject({
      isComplete: true,
      isFailed: false,
      label: 'Complete',
    })
  })
})

describe('selectionStatus', () => {
  it('preserves failed selection details', () => {
    expect(
      selectionStatus(
        selection({ status: 'failed', errorMessage: 'Google quota exceeded.' }),
      ),
    ).toMatchObject({
      detail: 'Google quota exceeded.',
      isComplete: true,
      isFailed: true,
      label: 'Failed',
    })
  })
})

function source(overrides: Partial<Source> = {}): Source {
  return {
    id: '018f3f77-44cb-73d9-b9d5-d293ad30b9a7a',
    title: 'Test Source',
    author: null,
    kind: 'pdf',
    originalFilename: 'test.pdf',
    tags: [],
    status: 'complete',
    assetAttached: true,
    selectionCount: 2,
    completedCount: 2,
    failedCount: 0,
    progressPercentage: 100,
    createdAt: '2026-05-03T01:54:13Z',
    updatedAt: '2026-05-03T01:54:13Z',
    ...overrides,
  }
}

function selection(overrides: Partial<SourceSelection> = {}): SourceSelection {
  return {
    id: '018f3f77-44cb-7abc-9c0f-8620f30747c4',
    kind: 'chapter',
    title: 'Chapter 1',
    label: '01',
    position: { ordinal: 1 },
    locator: { type: 'page_range', start: 1, end: 2 },
    status: 'complete',
    pipelineStage: null,
    errorMessage: null,
    errorDetails: {},
    tags: [],
    ...overrides,
  }
}
