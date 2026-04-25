import type { ConnectionPreviewItem, IntakeMode } from './-types'

export const intakeModes: Array<{ mode: IntakeMode; disabled?: boolean }> = [
  { mode: 'file' },
  { mode: 'url', disabled: true },
  { mode: 'text', disabled: true },
]

export const defaultTags = ['distributed-systems', 'databases', 'concurrency']

export const availableConnections: ConnectionPreviewItem[] = [
  {
    id: 'mit-6824',
    title: 'MIT 6.824: Distributed Systems',
    matchingTags: ['distributed-systems', 'concurrency'],
  },
  {
    id: 'pragmatic-programmer',
    title: 'The Pragmatic Programmer',
    matchingTags: ['concurrency'],
  },
  {
    id: 'rust-in-action',
    title: 'Rust in Action',
    matchingTags: ['concurrency'],
  },
]

export const defaultModelLabel = 'Claude Sonnet 4'

export const acceptedSourceFileTypes = ['application/pdf']
