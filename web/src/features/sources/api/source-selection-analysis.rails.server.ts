import { requestRails } from '#/lib/rails-api'
import { validate } from '#/lib/validation'
import type { SourceSelectionAnalysisResponse } from '../analysis.schemas'
import { sourceSelectionAnalysisResponseSchema } from '../analysis.schemas'

export async function getSourceSelectionAnalysisFromRails(
  selectionId: string,
  request: Request,
): Promise<SourceSelectionAnalysisResponse> {
  const payload = await requestRails(
    `/source_selections/${selectionId}`,
    { method: 'GET' },
    { request },
  )

  return validate(
    sourceSelectionAnalysisResponseSchema,
    payload,
    `getSourceSelectionAnalysis(${selectionId})`,
  )
}
