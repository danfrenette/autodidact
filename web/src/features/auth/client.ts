import { createAuthClient } from 'better-auth/react'

/**
 * Better Auth client instance for the browser.
 *
 * This client is used in React components to interact with the
 * Better Auth session (sign in, sign out, check session status).
 *
 * The server endpoint is at /api/auth (handled by routes/api/auth/$.ts)
 */
export const authClient = createAuthClient()

// Re-export hooks for convenience
export const { useSession, signIn, signOut } = authClient
