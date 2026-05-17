import { createTRPCRouter, publicProcedure } from '#/server/trpc/init'
import {
  listProviderCredentialsResponseSchema,
  listProviderRoleSettingsResponseSchema,
  listProvidersResponseSchema,
  providerAvailabilityResponseSchema,
  saveProviderCredentialInputSchema,
  saveProviderRoleSettingInputSchema,
} from '../provider.schemas'
import {
  getProviderAvailabilityFromRails,
  listProviderCredentialsFromRails,
  listProviderRoleSettingsFromRails,
  listProvidersFromRails,
  saveProviderCredentialInRails,
  saveProviderRoleSettingInRails,
} from './providers.rails.server'

export const providersRouter = createTRPCRouter({
  list: publicProcedure
    .output(listProvidersResponseSchema)
    .query(({ ctx }) => listProvidersFromRails(ctx.request)),
  credentials: publicProcedure
    .output(listProviderCredentialsResponseSchema)
    .query(({ ctx }) => listProviderCredentialsFromRails(ctx.request)),
  saveCredential: publicProcedure
    .input(saveProviderCredentialInputSchema)
    .mutation(({ ctx, input }) =>
      saveProviderCredentialInRails(input, ctx.request),
    ),
  roleSettings: publicProcedure
    .output(listProviderRoleSettingsResponseSchema)
    .query(({ ctx }) => listProviderRoleSettingsFromRails(ctx.request)),
  saveRoleSetting: publicProcedure
    .input(saveProviderRoleSettingInputSchema)
    .mutation(({ ctx, input }) =>
      saveProviderRoleSettingInRails(input, ctx.request),
    ),
  availability: publicProcedure
    .output(providerAvailabilityResponseSchema)
    .query(({ ctx }) => getProviderAvailabilityFromRails(ctx.request)),
})
