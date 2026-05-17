import type { z } from 'zod'
import type {
  listProviderCredentialsResponseSchema,
  listProviderRoleSettingsResponseSchema,
  listProvidersResponseSchema,
  providerAvailabilityResponseSchema,
  providerCredentialSchema,
  providerRoleSchema,
  providerRoleSettingSchema,
  saveProviderCredentialInputSchema,
  saveProviderRoleSettingInputSchema,
} from './provider.schemas'

export type ProviderRole = z.infer<typeof providerRoleSchema>
export type ProviderCredential = z.infer<typeof providerCredentialSchema>
export type ProviderRoleSetting = z.infer<typeof providerRoleSettingSchema>
export type ListProvidersResponse = z.infer<typeof listProvidersResponseSchema>
export type ListProviderCredentialsResponse = z.infer<
  typeof listProviderCredentialsResponseSchema
>
export type ListProviderRoleSettingsResponse = z.infer<
  typeof listProviderRoleSettingsResponseSchema
>
export type ProviderAvailabilityResponse = z.infer<
  typeof providerAvailabilityResponseSchema
>
export type SaveProviderCredentialInput = z.infer<
  typeof saveProviderCredentialInputSchema
>
export type SaveProviderRoleSettingInput = z.infer<
  typeof saveProviderRoleSettingInputSchema
>
