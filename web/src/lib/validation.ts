import type { ZodSchema, z } from 'zod'

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
