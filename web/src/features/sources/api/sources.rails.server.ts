import axios, { isAxiosError } from 'axios'
import {
  createSourceResponseSchema,
  getSourceResponseSchema,
  listSourcesResponseSchema,
  railsCsrfResponseSchema,
} from '../source.schemas'

import type {
  CreateSourceInput,
  CreateSourceResponse,
  GetSourceResponse,
  ListSourcesResponse,
} from '../source.types'

export async function createSourceInRails(
  input: CreateSourceInput,
  request: Request,
): Promise<CreateSourceResponse> {
  const railsApiUrl = getRailsApiUrl()
  const cookie = request.headers.get('cookie') ?? ''
  const csrfToken = await fetchRailsCsrfToken(railsApiUrl, cookie)
  const response = await axios
    .post(
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
    )
    .catch((error: unknown) => {
      if (isAxiosError(error) && error.response) {
        throw new Error(
          getRailsErrorMessage(error.response.data, error.response.status),
        )
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
  const response = await axios
    .get(new URL('/csrf-token', railsApiUrl).toString(), {
      headers: {
        Accept: 'application/json',
        Cookie: cookie,
      },
    })
    .catch((error: unknown) => {
      if (isAxiosError(error) && error.response) {
        throw new Error('Unable to fetch Rails CSRF token')
      }

      throw error
    })

  return railsCsrfResponseSchema.parse(response.data).data.csrfToken
}

export async function listSourcesFromRails(
  request: Request,
): Promise<ListSourcesResponse> {
  const railsApiUrl = getRailsApiUrl()
  const cookie = request.headers.get('cookie') ?? ''

  const response = await axios
    .get(new URL('/sources', railsApiUrl).toString(), {
      headers: {
        Accept: 'application/json',
        Cookie: cookie,
      },
    })
    .catch((error: unknown) => {
      if (isAxiosError(error) && error.response) {
        throw new Error(
          getRailsErrorMessage(error.response.data, error.response.status),
        )
      }

      throw error
    })

  return listSourcesResponseSchema.parse(response.data)
}

export async function getSourceFromRails(
  sourceId: number,
  request: Request,
): Promise<GetSourceResponse> {
  const railsApiUrl = getRailsApiUrl()
  const cookie = request.headers.get('cookie') ?? ''

  const response = await axios
    .get(new URL(`/sources/${sourceId}`, railsApiUrl).toString(), {
      headers: {
        Accept: 'application/json',
        Cookie: cookie,
      },
    })
    .catch((error: unknown) => {
      if (isAxiosError(error) && error.response) {
        throw new Error(
          getRailsErrorMessage(error.response.data, error.response.status),
        )
      }

      throw error
    })

  return getSourceResponseSchema.parse(response.data)
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
