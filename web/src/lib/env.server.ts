const requiredEnv = (name: string) => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

const splitCommaList = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)

export const serverEnv = {
  betterAuthSecret: requiredEnv('BETTER_AUTH_SECRET'),
  betterAuthTrustedOrigins: splitCommaList(
    requiredEnv('BETTER_AUTH_TRUSTED_ORIGINS'),
  ),
  betterAuthUrl: requiredEnv('BETTER_AUTH_URL'),
  githubClientId: requiredEnv('GITHUB_CLIENT_ID'),
  githubClientSecret: requiredEnv('GITHUB_CLIENT_SECRET'),
  googleClientId: requiredEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: requiredEnv('GOOGLE_CLIENT_SECRET'),
}
