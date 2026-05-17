import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '#/providers/trpc'

export function useProviderSettings() {
  const trpc = useTRPC()

  const providers = useQuery(trpc.providers.list.queryOptions())
  const credentials = useQuery(trpc.providers.credentials.queryOptions())
  const roleSettings = useQuery(trpc.providers.roleSettings.queryOptions())
  const availability = useQuery(trpc.providers.availability.queryOptions())

  return { availability, credentials, providers, roleSettings }
}

export function useSaveProviderCredential() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.providers.saveCredential.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.providers.credentials.queryFilter(),
        )
        await queryClient.invalidateQueries(
          trpc.providers.availability.queryFilter(),
        )
      },
    }),
  )
}

export function useSaveProviderRoleSetting() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.providers.saveRoleSetting.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.providers.roleSettings.queryFilter(),
        )
        await queryClient.invalidateQueries(
          trpc.providers.availability.queryFilter(),
        )
      },
    }),
  )
}
