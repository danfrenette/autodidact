import { requestRails } from '#/lib/rails-api'
import { validate } from '#/lib/validation'
import {
  listProviderCredentialsResponseSchema,
  listProviderRoleSettingsResponseSchema,
  listProvidersResponseSchema,
  providerAvailabilityResponseSchema,
  providerCredentialResponseSchema,
  providerRoleSettingResponseSchema,
} from '../provider.schemas'
import type {
  ListProviderCredentialsResponse,
  ListProviderRoleSettingsResponse,
  ListProvidersResponse,
  ProviderAvailabilityResponse,
  SaveProviderCredentialInput,
  SaveProviderRoleSettingInput,
} from '../provider.types'

export async function listProvidersFromRails(
  request: Request,
): Promise<ListProvidersResponse> {
  const payload = await requestRails(
    '/providers',
    { method: 'GET' },
    { request },
  )

  return validate(listProvidersResponseSchema, payload, 'listProviders')
}

export async function listProviderCredentialsFromRails(
  request: Request,
): Promise<ListProviderCredentialsResponse> {
  const payload = await requestRails(
    '/provider_credentials',
    { method: 'GET' },
    { request },
  )

  return validate(
    listProviderCredentialsResponseSchema,
    payload,
    'listProviderCredentials',
  )
}

export async function saveProviderCredentialInRails(
  input: SaveProviderCredentialInput,
  request: Request,
) {
  const payload = await requestRails(
    '/provider_credentials',
    {
      method: 'POST',
      data: {
        provider_credential: {
          provider: input.provider,
          api_key: input.apiKey,
        },
      },
    },
    { request, csrf: true },
  )

  return validate(
    providerCredentialResponseSchema,
    payload,
    'saveProviderCredential',
  )
}

export async function listProviderRoleSettingsFromRails(
  request: Request,
): Promise<ListProviderRoleSettingsResponse> {
  const payload = await requestRails(
    '/provider_role_settings',
    { method: 'GET' },
    { request },
  )

  return validate(
    listProviderRoleSettingsResponseSchema,
    payload,
    'listProviderRoleSettings',
  )
}

export async function saveProviderRoleSettingInRails(
  input: SaveProviderRoleSettingInput,
  request: Request,
) {
  const payload = await requestRails(
    '/provider_role_settings',
    {
      method: 'POST',
      data: { provider_role_setting: input },
    },
    { request, csrf: true },
  )

  return validate(
    providerRoleSettingResponseSchema,
    payload,
    'saveProviderRoleSetting',
  )
}

export async function getProviderAvailabilityFromRails(
  request: Request,
): Promise<ProviderAvailabilityResponse> {
  const payload = await requestRails(
    '/provider_availability',
    { method: 'GET' },
    { request },
  )

  return validate(
    providerAvailabilityResponseSchema,
    payload,
    'getProviderAvailability',
  )
}
