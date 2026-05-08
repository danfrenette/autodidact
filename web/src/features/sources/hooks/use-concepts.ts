import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '#/providers/trpc'

export function useConcepts(selectionId: string) {
  const trpc = useTRPC()

  return useQuery(trpc.sources.getConcepts.queryOptions({ selectionId }))
}
