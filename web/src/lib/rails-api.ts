import axios from 'axios'
import type {
  RailsHealthcheck,
  RailsRequestConfig,
  RailsRequestOptions,
} from './rails-api.types'

function getRailsBaseUrl(): string | null {
  return process.env.RAILS_API_URL?.trim().replace(/\/$/, '') || null
}

function requireRailsBaseUrl(): string {
  const baseUrl = getRailsBaseUrl()

  if (!baseUrl) {
    throw new Error('RAILS_API_URL is not configured')
  }

  return baseUrl
}

function getHealthcheckPath() {
  return process.env.RAILS_HEALTHCHECK_PATH?.trim() || '/up'
}

function railsUrl(path: string, baseUrl = requireRailsBaseUrl()) {
  return new URL(path, `${baseUrl}/`).toString()
}

function requestCookie(request: Request | undefined) {
  return request?.headers.get('cookie') ?? ''
}

function railsErrorMessage(payload: unknown, status: number) {
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

function railsErrorCode(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'object' &&
    'code' in payload.error &&
    typeof payload.error.code === 'string'
  ) {
    return payload.error.code
  }

  return null
}

function railsErrorDetails(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'object' &&
    'details' in payload.error
  ) {
    return payload.error.details
  }

  return null
}

export class RailsApiError extends Error {
  code: string | null
  details: unknown
  status: number

  constructor(
    message: string,
    status: number,
    code: string | null,
    details: unknown,
  ) {
    super(message)
    this.name = 'RailsApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

async function csrfToken(cookie: string) {
  const response = await axios.request({
    method: 'GET',
    url: railsUrl('/csrf-token'),
    headers: {
      Accept: 'application/json',
      Cookie: cookie,
    },
  })

  const payload = response.data

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object' &&
    'csrfToken' in payload.data &&
    typeof payload.data.csrfToken === 'string'
  ) {
    return payload.data.csrfToken
  }

  throw new Error('Unable to fetch Rails CSRF token')
}

export async function requestRails<T = unknown>(
  path: string,
  config: RailsRequestConfig = {},
  options: RailsRequestOptions = {},
): Promise<T> {
  const cookie = requestCookie(options.request)
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Cookie: cookie,
    ...(config.data ? { 'Content-Type': 'application/json' } : {}),
  }

  if (options.csrf) {
    headers['X-CSRF-Token'] = await csrfToken(cookie)
  }

  try {
    const response = await axios.request<T>({
      ...config,
      url: railsUrl(path),
      headers,
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new RailsApiError(
        railsErrorMessage(error.response.data, error.response.status),
        error.response.status,
        railsErrorCode(error.response.data),
        railsErrorDetails(error.response.data),
      )
    }

    throw error
  }
}

function truncateBody(body: string) {
  const normalized = body.replace(/\s+/g, ' ').trim()
  return normalized ? normalized.slice(0, 180) : null
}

function previewBody(body: unknown) {
  if (typeof body === 'string') {
    return truncateBody(body)
  }

  if (body == null) {
    return null
  }

  return truncateBody(JSON.stringify(body))
}

export async function fetchRailsHealthcheck(): Promise<RailsHealthcheck> {
  const baseUrl = getRailsBaseUrl()
  const healthcheckPath = getHealthcheckPath()

  if (!baseUrl) {
    return {
      configured: false,
      ok: false,
      baseUrl: null,
      healthcheckPath,
      requestUrl: null,
      status: null,
      bodyPreview: null,
      error: 'RAILS_API_URL is not configured',
    }
  }

  const requestUrl = railsUrl(healthcheckPath, baseUrl)

  try {
    const response = await axios.request({
      method: 'GET',
      url: requestUrl,
      headers: {
        Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
      },
      validateStatus: () => true,
    })
    const body = previewBody(response.data)
    const ok = response.status >= 200 && response.status < 300

    return {
      configured: true,
      ok,
      baseUrl,
      healthcheckPath,
      requestUrl,
      status: response.status,
      bodyPreview: body,
      error: ok ? null : `Rails returned HTTP ${response.status}`,
    }
  } catch (error) {
    return {
      configured: true,
      ok: false,
      baseUrl,
      healthcheckPath,
      requestUrl,
      status: null,
      bodyPreview: null,
      error:
        error instanceof Error ? error.message : 'Unknown connection error',
    }
  }
}
