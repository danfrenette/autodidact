import axios, { isAxiosError } from 'axios'
import {
  createSourceResponseSchema,
  railsCsrfResponseSchema,
} from '../source.schemas'

import type { CreateSourceInput, CreateSourceResponse } from '../source.types'

export async function createSourceInRails(
  input: CreateSourceInput,
  request: Request,
): Promise<CreateSourceResponse> {
  const railsApiUrl = getRailsApiUrl()
  const cookie = request.headers.get('cookie') ?? ''
  const csrfToken = await fetchRailsCsrfToken(railsApiUrl, cookie)
  const response = await axios.post(
    new URL('/sources', railsApiUrl).toString(),
    {
      source: {
        title: input.title,
        kind: input.kind,
        original_filename: input.originalFilename,
        selections: input.selections,
      },
    },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
      },
    },
  ).catch((error: unknown) => {
    if (isAxiosError(error) && error.response) {
      throw new Error(getRailsErrorMessage(error.response.data, error.response.status))
    }

    throw error
  })

  return createSourceResponseSchema.parse(response.data)
}

function getRailsApiUrl() {
  const railsApiUrl = process.env.RAILS_API_URL

  if (!railsApiUrl) {
    throw new Error('RAILS_API_URL is not configured')
  }

  return railsApiUrl
}

async function fetchRailsCsrfToken(railsApiUrl: string, cookie: string) {
  const response = await axios.get(
    new URL('/csrf-token', railsApiUrl).toString(),
    {
      headers: {
        Accept: 'application/json',
        Cookie: cookie,
      },
    },
  ).catch((error: unknown) => {
    if (isAxiosError(error) && error.response) {
      throw new Error('Unable to fetch Rails CSRF token')
    }

    throw error
  })

  try {
    return railsCsrfResponseSchema.parse(response.data).data.csrfToken
  } catch {
    throw new Error('Unable to fetch Rails CSRF token')
  }
}

function getRailsErrorMessage(payload: unknown, status: number) {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'object' &&
    'message' in payload.error &&
    typeof payload.error.message === 'string'
  ) {
    return payload.error.message
  }

  return `Rails returned HTTP ${status}`
}
