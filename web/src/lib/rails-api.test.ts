import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchRailsHealthcheck } from './rails-api'

afterEach(() => {
  vi.unstubAllEnvs()
})

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
})
