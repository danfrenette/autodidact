import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '#/providers/trpc'

export function useSource(sourceId: number) {
  const trpc = useTRPC()

  return useQuery(
    trpc.sources.get.queryOptions({ id: sourceId }, { enabled: sourceId > 0 }),
  )
}
