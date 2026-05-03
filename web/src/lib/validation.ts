import type { ZodSchema, z } from 'zod'

/**
 * Validates data against a Zod schema with development-only logging.
 * Returns the parsed data on success, throws on failure.
 *
 * Matt Pocock/Kent C. Dodds approach:
 * - Validate at runtime boundaries (API responses)
 * - Fail fast with clear error messages
 * - Log details in development for debugging
 */
export function validate<T extends ZodSchema>(
  schema: T,
  data: unknown,
  context?: string,
): z.infer<T> {
  const result = schema.safeParse(data)

  if (!result.success) {
    const message = context
      ? `Validation failed for ${context}`
      : 'Validation failed'

    // In development, log the full details
    if (process.env.NODE_ENV === 'development') {
      console.error(message)
      console.error('Schema errors:', result.error.flatten())
      console.error('Received data:', JSON.stringify(data, null, 2))
    }

    throw new Error(
      `${message}: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')}`,
    )
  }

  return result.data
}
