/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ORG: string
  readonly VITE_SENTRY_PROJECT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly BETTER_AUTH_SECRET?: string
      readonly BETTER_AUTH_URL?: string
      readonly RAILS_API_URL?: string
      readonly RAILS_HEALTHCHECK_PATH?: string
      readonly SENTRY_AUTH_TOKEN?: string
      readonly VITE_SENTRY_DSN?: string
      readonly VITE_SENTRY_ORG?: string
      readonly VITE_SENTRY_PROJECT?: string
    }
  }
}

export {}
