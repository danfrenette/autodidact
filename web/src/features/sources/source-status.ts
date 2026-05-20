import type { Source, SourceSelection } from './source.types'

type StatusPresentation = {
  action: 'provider_settings' | 'retry' | null
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
      action: null,
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
      action: null,
      dotClassName: 'bg-ad-text-muted',
      isComplete: true,
      isFailed: false,
      label: 'Complete',
      textClassName: 'text-ad-text-secondary',
    }
  }

  return {
    detail: null,
    action: null,
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
      action: failureAction(selection),
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
      action: null,
      dotClassName: 'bg-ad-text-secondary',
      isComplete: true,
      isFailed: false,
      label: 'Complete',
      textClassName: 'text-ad-text-muted',
    }
  }

  return {
    detail: null,
    action: null,
    dotClassName: 'bg-ad-accent',
    isComplete: false,
    isFailed: false,
    label: 'Processing',
    textClassName: 'text-ad-accent',
  }
}

function failureAction(
  selection: SourceSelection,
): StatusPresentation['action'] {
  const action = selection.errorDetails.action

  return action === 'provider_settings' ? 'provider_settings' : 'retry'
}
