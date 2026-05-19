import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trpcClient } from '#/providers/tanstack-query'
import { useTRPC } from '#/providers/trpc'

export function useRetrySource(sourceId: string) {
  const queryClient = useQueryClient()
  const trpc = useTRPC()

  return useMutation({
    mutationFn: () => trpcClient.sources.retry.mutate({ id: sourceId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(trpc.sources.list.queryFilter())
      await queryClient.invalidateQueries(
        trpc.sources.get.queryFilter({ id: sourceId }),
      )
    },
  })
}
