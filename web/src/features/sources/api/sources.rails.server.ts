import { requestRails } from '#/lib/rails-api'
import { validate } from '#/lib/validation'
import {
  createSourceResponseSchema,
  getSourceResponseSchema,
  listSourcesResponseSchema,
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
  const payload = await requestRails(
    '/sources',
    {
      method: 'POST',
      data: {
        source: {
          title: input.title,
          kind: input.kind,
          author: input.author,
          original_filename: input.originalFilename,
          tags: input.tags,
          selections: input.selections,
        },
      },
    },
    { request, csrf: true },
  )

  return validate(createSourceResponseSchema, payload, 'createSource')
}

export async function listSourcesFromRails(
  request: Request,
): Promise<ListSourcesResponse> {
  const payload = await requestRails('/sources', { method: 'GET' }, { request })

  return validate(listSourcesResponseSchema, payload, 'listSources')
}

export async function getSourceFromRails(
  sourceId: string,
  request: Request,
): Promise<GetSourceResponse> {
  const payload = await requestRails(
    `/sources/${sourceId}`,
    { method: 'GET' },
    { request },
  )

  return validate(getSourceResponseSchema, payload, `getSource(${sourceId})`)
}
