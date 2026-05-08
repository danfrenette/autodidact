import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchRailsHealthcheck, requestRails } from './rails-api'

vi.mock('axios', () => ({
  default: {
    request: vi.fn(),
    isAxiosError: vi.fn(),
  },
}))

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

const axiosRequest = vi.mocked(axios.request)
const isAxiosError = vi.mocked(axios.isAxiosError)

describe('fetchRailsHealthcheck', () => {
  it('reports missing Rails configuration without attempting a request', async () => {
    vi.stubEnv('RAILS_API_URL', undefined)
    vi.stubEnv('RAILS_HEALTHCHECK_PATH', undefined)

    await expect(fetchRailsHealthcheck()).resolves.toEqual({
      configured: false,
      ok: false,
      baseUrl: null,
      healthcheckPath: '/up',
      requestUrl: null,
      status: null,
      bodyPreview: null,
      error: 'RAILS_API_URL is not configured',
    })
  })

  it('checks Rails health through axios', async () => {
    vi.stubEnv('RAILS_API_URL', 'http://localhost:3001/')
    vi.stubEnv('RAILS_HEALTHCHECK_PATH', '/up')
    axiosRequest.mockResolvedValueOnce({ status: 200, data: { ok: true } })

    await expect(fetchRailsHealthcheck()).resolves.toMatchObject({
      configured: true,
      ok: true,
      baseUrl: 'http://localhost:3001',
      requestUrl: 'http://localhost:3001/up',
      status: 200,
      bodyPreview: '{"ok":true}',
      error: null,
    })

    expect(axiosRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'http://localhost:3001/up',
      headers: {
        Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
      },
      validateStatus: expect.any(Function),
    })
  })

  it('reports non-2xx Rails health responses', async () => {
    vi.stubEnv('RAILS_API_URL', 'http://localhost:3001')
    axiosRequest.mockResolvedValueOnce({ status: 503, data: 'not ready' })

    await expect(fetchRailsHealthcheck()).resolves.toMatchObject({
      ok: false,
      status: 503,
      bodyPreview: 'not ready',
      error: 'Rails returned HTTP 503',
    })
  })
})

describe('requestRails', () => {
  it('forwards request cookies to Rails', async () => {
    vi.stubEnv('RAILS_API_URL', 'http://localhost:3001')
    axiosRequest.mockResolvedValueOnce({ data: { data: { sources: [] } } })

    const request = new Request('http://localhost:3000/api/trpc', {
      headers: { cookie: 'better-auth.session=abc' },
    })

    await expect(
      requestRails('/sources', { method: 'GET' }, { request }),
    ).resolves.toEqual({
      data: { sources: [] },
    })

    expect(axiosRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'http://localhost:3001/sources',
      headers: {
        Accept: 'application/json',
        Cookie: 'better-auth.session=abc',
      },
    })
  })

  it('fetches and forwards a Rails CSRF token when requested', async () => {
    vi.stubEnv('RAILS_API_URL', 'http://localhost:3001')
    axiosRequest
      .mockResolvedValueOnce({ data: { data: { csrfToken: 'csrf-token' } } })
      .mockResolvedValueOnce({
        data: { data: { source: { id: 'source-id' } } },
      })

    const request = new Request('http://localhost:3000/api/trpc', {
      headers: { cookie: 'better-auth.session=abc' },
    })

    await requestRails(
      '/sources',
      { method: 'POST', data: { source: { title: 'DDIA' } } },
      { request, csrf: true },
    )

    expect(axiosRequest).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: 'http://localhost:3001/csrf-token',
      headers: {
        Accept: 'application/json',
        Cookie: 'better-auth.session=abc',
      },
    })
    expect(axiosRequest).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      data: { source: { title: 'DDIA' } },
      url: 'http://localhost:3001/sources',
      headers: {
        Accept: 'application/json',
        Cookie: 'better-auth.session=abc',
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'csrf-token',
      },
    })
  })

  it('translates Rails error payloads', async () => {
    vi.stubEnv('RAILS_API_URL', 'http://localhost:3001')
    const error = {
      response: {
        status: 422,
        data: { error: { message: 'Source could not be created' } },
      },
    }
    axiosRequest.mockRejectedValueOnce(error)
    isAxiosError.mockReturnValueOnce(true)

    await expect(requestRails('/sources', { method: 'GET' })).rejects.toThrow(
      'Source could not be created',
    )
  })
})
