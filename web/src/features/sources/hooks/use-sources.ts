import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '#/providers/trpc'

export function useSources() {
  const trpc = useTRPC()

  return useQuery(
    trpc.sources.list.queryOptions(undefined, {
      refetchInterval: (query) => {
        const sources = query.state.data?.data.sources ?? []

        return sources.some(
          (source) =>
            source.status !== 'complete' && source.status !== 'failed',
        )
          ? 2000
          : false
      },
    }),
  )
}
