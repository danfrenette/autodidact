import type { AxiosRequestConfig } from 'axios'

export type RailsHealthcheck = {
  configured: boolean
  ok: boolean
  baseUrl: string | null
  healthcheckPath: string
  requestUrl: string | null
  status: number | null
  bodyPreview: string | null
  error: string | null
}

export type RailsRequestOptions = {
  request?: Request
  csrf?: boolean
}

export type RailsRequestConfig = Omit<AxiosRequestConfig, 'url' | 'headers'>
