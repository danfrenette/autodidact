import type { Source, SourceSelection } from './source.types'

type StatusPresentation = {
  detail: string | null
  dotClassName: string
  isComplete: boolean
  isFailed: boolean
  label: string
  textClassName: string
}

export function sourceStatus(source: Source): StatusPresentation {
  if (source.status === 'failed' || source.failedCount > 0) {
    return {
      detail: 'Processing failed',
      dotClassName: 'bg-ad-accent',
      isComplete: true,
      isFailed: true,
      label: 'Failed',
      textClassName: 'text-ad-accent',
    }
  }

  if (source.completedCount === source.selectionCount) {
    return {
      detail: null,
      dotClassName: 'bg-ad-text-muted',
      isComplete: true,
      isFailed: false,
      label: 'Complete',
      textClassName: 'text-ad-text-secondary',
    }
  }

  return {
    detail: null,
    dotClassName: 'bg-ad-accent',
    isComplete: false,
    isFailed: false,
    label: 'Processing',
    textClassName: 'text-ad-accent',
  }
}

export function selectionStatus(
  selection: SourceSelection,
): StatusPresentation {
  if (selection.status === 'failed') {
    return {
      detail: selection.errorMessage,
      dotClassName: 'bg-ad-accent',
      isComplete: true,
      isFailed: true,
      label: 'Failed',
      textClassName: 'text-ad-accent',
    }
  }

  if (selection.status === 'complete') {
    return {
      detail: null,
      dotClassName: 'bg-ad-text-secondary',
      isComplete: true,
      isFailed: false,
      label: 'Complete',
      textClassName: 'text-ad-text-muted',
    }
  }

  return {
    detail: null,
    dotClassName: 'bg-ad-accent',
    isComplete: false,
    isFailed: false,
    label: 'Processing',
    textClassName: 'text-ad-accent',
  }
}
