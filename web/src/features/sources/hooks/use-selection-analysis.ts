import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '#/providers/trpc'

export function useSelectionAnalysis(selectionId: string) {
  const trpc = useTRPC()

  return useQuery(
    trpc.sources.getSelectionAnalysis.queryOptions(
      { selectionId },
      {
        refetchInterval: (query) =>
          query.state.data?.data.selection.status === 'complete' ||
          query.state.data?.data.selection.status === 'failed'
            ? false
            : 2000,
      },
    ),
  )
}
