import { afterEach, describe, expect, it } from 'vitest'
import { fetchRailsHealthcheck } from './rails-api'

const originalRailsApiUrl = process.env.RAILS_API_URL
const originalRailsHealthcheckPath = process.env.RAILS_HEALTHCHECK_PATH

afterEach(() => {
  process.env.RAILS_API_URL = originalRailsApiUrl
  process.env.RAILS_HEALTHCHECK_PATH = originalRailsHealthcheckPath
})

describe('fetchRailsHealthcheck', () => {
  it('reports missing Rails configuration without attempting a request', async () => {
    delete process.env.RAILS_API_URL
    delete process.env.RAILS_HEALTHCHECK_PATH

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
