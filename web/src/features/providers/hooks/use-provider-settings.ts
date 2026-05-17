import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '#/providers/trpc'

export function useProviders() {
  const trpc = useTRPC()

  return useQuery(trpc.providers.list.queryOptions())
}

export function useProviderRoleSettings() {
  const trpc = useTRPC()

  return useQuery(trpc.providers.roleSettings.queryOptions())
}

export function useProviderCredential(provider: string) {
  const trpc = useTRPC()
  const query = useQuery(trpc.providers.credentials.queryOptions())
  const credential = query.data?.data.credentials.find(
    (credential) => credential.provider === provider,
  )

  return {
    credential,
    displayKey: credentialDisplayKey({
      credential,
      isError: query.isError,
      isLoading: query.isLoading,
    }),
    error: query.error,
    isError: query.isError,
    isLoading: query.isLoading,
    statusLabel: credentialStatusLabel({
      credential,
      isError: query.isError,
      isLoading: query.isLoading,
    }),
  }
}

type CredentialState = {
  credential?: { displayKey: string | null; status: string }
  isError: boolean
  isLoading: boolean
}

function credentialStatusLabel({
  credential,
  isError,
  isLoading,
}: CredentialState) {
  if (isLoading) return 'Checking...'
  if (isError) return 'Unavailable'
  if (credential?.status === 'connected') return 'Connected'
  return 'Not connected'
}

function credentialDisplayKey({
  credential,
  isError,
  isLoading,
}: CredentialState) {
  if (isLoading) return 'Loading key status...'
  if (isError) return 'Unable to load key status'
  return credential?.displayKey ?? 'No key saved'
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
