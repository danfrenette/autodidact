import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '#/providers/trpc'

export function useSources() {
  const trpc = useTRPC()

  return useQuery(trpc.sources.list.queryOptions())
}
