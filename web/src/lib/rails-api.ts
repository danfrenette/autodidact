type RailsHealthcheck = {
  configured: boolean
  ok: boolean
  baseUrl: string | null
  healthcheckPath: string
  requestUrl: string | null
  status: number | null
  bodyPreview: string | null
  error: string | null
}

function getRailsBaseUrl() {
  return process.env.RAILS_API_URL?.trim().replace(/\/$/, '') || null
}

function getHealthcheckPath() {
  return process.env.RAILS_HEALTHCHECK_PATH?.trim() || '/up'
}

function truncateBody(body: string) {
  const normalized = body.replace(/\s+/g, ' ').trim()
  return normalized ? normalized.slice(0, 180) : null
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

  const requestUrl = new URL(healthcheckPath, `${baseUrl}/`).toString()

  try {
    const response = await fetch(requestUrl, {
      headers: {
        Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
      },
      cache: 'no-store',
    })
    const body = truncateBody(await response.text())

    return {
      configured: true,
      ok: response.ok,
      baseUrl,
      healthcheckPath,
      requestUrl,
      status: response.status,
      bodyPreview: body,
      error: response.ok ? null : `Rails returned HTTP ${response.status}`,
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
