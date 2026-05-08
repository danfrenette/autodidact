import axios, { isAxiosError } from 'axios'
import { validate } from '#/lib/validation'
import { conceptsResponseSchema } from '../concept.schemas'
import type { Concept } from '../concept.types'

export async function getConceptsFromRails(
  selectionId: string,
  request: Request,
): Promise<Concept[]> {
  const railsApiUrl = getRailsApiUrl()
  const cookie = request.headers.get('cookie') ?? ''

  const response = await axios
    .get(
      new URL(
        `/source_selections/${selectionId}/concepts`,
        railsApiUrl,
      ).toString(),
      {
        headers: {
          Accept: 'application/json',
          Cookie: cookie,
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

  return validate(
    conceptsResponseSchema,
    response.data,
    `getConcepts(${selectionId})`,
  )
}

function getRailsApiUrl() {
  const railsApiUrl = process.env.RAILS_API_URL

  if (!railsApiUrl) {
    throw new Error('RAILS_API_URL is not configured')
  }

  return railsApiUrl
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
