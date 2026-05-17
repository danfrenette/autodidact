import { z } from 'zod'

export const providerRoleSchema = z.enum(['embedding', 'generation'])

export const providerDefinitionSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  supportedRoles: z.array(providerRoleSchema),
  requiresCredentials: z.boolean(),
  modelsByRole: z.record(providerRoleSchema, z.array(z.string())),
  defaultModelsByRole: z.record(providerRoleSchema, z.string()),
})

export const providerCredentialSchema = z.object({
  id: z.string().uuid(),
  provider: z.string(),
  credentialKind: z.string(),
  status: z.enum(['connected', 'disconnected', 'error']),
  displayKey: z.string().nullable(),
  lastVerifiedAt: z.string().nullable(),
  lastErrorMessage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const providerRoleSettingSchema = z.object({
  id: z.string().uuid(),
  role: providerRoleSchema,
  provider: z.string(),
  model: z.string(),
  providerCredentialId: z.string().uuid(),
  credentialStatus: z.enum(['connected', 'disconnected', 'error']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const listProvidersResponseSchema = z.object({
  data: z.object({ providers: z.array(providerDefinitionSchema) }),
  error: z.null(),
  meta: z.record(z.string(), z.unknown()),
})

export const listProviderCredentialsResponseSchema = z.object({
  data: z.object({ credentials: z.array(providerCredentialSchema) }),
  error: z.null(),
  meta: z.record(z.string(), z.unknown()),
})

export const providerCredentialResponseSchema = z.object({
  data: z.object({ credential: providerCredentialSchema }),
  error: z.null(),
  meta: z.record(z.string(), z.unknown()),
})

export const listProviderRoleSettingsResponseSchema = z.object({
  data: z.object({ roleSettings: z.array(providerRoleSettingSchema) }),
  error: z.null(),
  meta: z.record(z.string(), z.unknown()),
})

export const providerRoleSettingResponseSchema = z.object({
  data: z.object({ roleSetting: providerRoleSettingSchema }),
  error: z.null(),
  meta: z.record(z.string(), z.unknown()),
})

export const providerAvailabilityResponseSchema = z.object({
  data: z.object({
    available: z.boolean(),
    missingRoles: z.array(providerRoleSchema),
    roleSettings: z.array(providerRoleSettingSchema),
  }),
  error: z.null(),
  meta: z.record(z.string(), z.unknown()),
})

export const saveProviderCredentialInputSchema = z.object({
  provider: z.string(),
  apiKey: z.string().min(1),
})

export const saveProviderRoleSettingInputSchema = z.object({
  role: providerRoleSchema,
  provider: z.string(),
  model: z.string().min(1),
})
