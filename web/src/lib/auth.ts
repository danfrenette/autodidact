import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { pgPool } from './db.server'

function requireEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

const githubClientId = requireEnvVar('GITHUB_CLIENT_ID')
const githubClientSecret = requireEnvVar('GITHUB_CLIENT_SECRET')
const googleClientId = requireEnvVar('GOOGLE_CLIENT_ID')
const googleClientSecret = requireEnvVar('GOOGLE_CLIENT_SECRET')

export const auth = betterAuth({
  database: pgPool,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    },
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
  plugins: [tanstackStartCookies()],
})
