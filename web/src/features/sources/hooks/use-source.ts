import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '#/providers/trpc'

export function useSource(sourceId: string) {
  const trpc = useTRPC()

  return useQuery(
    trpc.sources.get.queryOptions(
      { id: sourceId },
      {
        enabled: !!sourceId,
        refetchInterval: (query) => {
          const source = query.state.data?.data

          return source &&
            source.status !== 'complete' &&
            source.status !== 'failed'
            ? 2000
            : false
        },
      },
    ),
  )
}
