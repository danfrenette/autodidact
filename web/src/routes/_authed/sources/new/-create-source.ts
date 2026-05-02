import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'

const createSourceInput = z.object({
  title: z.string().min(1),
  kind: z.literal('pdf'),
  originalFilename: z.string().min(1),
  selections: z.array(z.object({
    kind: z.literal('chapter'),
    title: z.string().min(1),
    label: z.string().min(1),
    position: z.object({ ordinal: z.number().int().positive() }),
    locator: z.object({
      type: z.literal('page_range'),
      start: z.number().int().positive(),
      end: z.number().int().positive(),
    }),
  })),
})

function getRailsApiUrl() {
  const railsApiUrl = process.env.RAILS_API_URL

  if (!railsApiUrl) {
    throw new Error('RAILS_API_URL is not configured')
  }

  return railsApiUrl
}

export const createSource = createServerFn({ method: 'POST' })
  .inputValidator(createSourceInput)
  .handler(async ({ data }) => {
    const request = getRequest()
    const cookie = request.headers.get('cookie') ?? ''
    const railsApiUrl = getRailsApiUrl()
    const csrfResponse = await fetch(new URL('/csrf-token', railsApiUrl), {
      headers: {
        Accept: 'application/json',
        Cookie: cookie,
      },
    })
    const csrfPayload = await csrfResponse.json()
    const csrfToken = csrfPayload.data?.csrfToken

    if (!csrfResponse.ok || typeof csrfToken !== 'string') {
      throw new Error('Unable to fetch Rails CSRF token')
    }

    const response = await fetch(new URL('/sources', railsApiUrl), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        source: {
          title: data.title,
          kind: data.kind,
          original_filename: data.originalFilename,
          selections: data.selections,
        },
      }),
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(payload?.error?.message ?? `Rails returned HTTP ${response.status}`)
    }

    return payload
  })
