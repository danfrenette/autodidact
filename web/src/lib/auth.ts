import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { pgPool } from './db.server'
import { serverEnv } from './env.server'

export const auth = betterAuth({
  baseURL: serverEnv.betterAuthUrl,
  database: pgPool,
  emailAndPassword: {
    enabled: true,
  },
  secret: serverEnv.betterAuthSecret,
  trustedOrigins: serverEnv.betterAuthTrustedOrigins,
  socialProviders: {
    github: {
      clientId: serverEnv.githubClientId,
      clientSecret: serverEnv.githubClientSecret,
    },
    google: {
      clientId: serverEnv.googleClientId,
      clientSecret: serverEnv.googleClientSecret,
    },
  },
  plugins: [tanstackStartCookies()],
})
