import { useSelectionAnalysis } from './use-selection-analysis'

export function useConcepts(selectionId: string) {
  const query = useSelectionAnalysis(selectionId)

  return {
    ...query,
    data: query.data?.data.concepts,
  }
}
