import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '#/providers/trpc'

export function useCreateSource() {
  const trpc = useTRPC()

  return useMutation(trpc.sources.create.mutationOptions())
}
