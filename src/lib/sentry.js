import * as Sentry from '@sentry/react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN

export function initSentry() {
  if (!SENTRY_DSN || !import.meta.env.PROD) return
  
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        maskAllInputs: true,
        blockAllMedia: false
      })
    ],
    tracesSampleRate: 0.1, // 10% of transactions
    replaysSessionSampleRate: 0.01, // 1% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of errors
    beforeSend(event) {
      // Sanitize events to remove any PII
      if (event.request) {
        delete event.request.cookies
        delete event.request.headers
      }
      return event
    },
    ignoreErrors: [
      // Ignore common non-actionable errors
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Network Error',
      'Failed to fetch',
      'AbortError'
    ]
  })
}

export function captureException(error, context = {}) {
  if (!SENTRY_DSN) {
    console.error('Error captured:', error, context)
    return
  }
  Sentry.captureException(error, { extra: context })
}

export function captureMessage(message, level = 'info') {
  if (!SENTRY_DSN) {
    console.log(`[${level}] ${message}`)
    return
  }
  Sentry.captureMessage(message, level)
}

export function setUser(user) {
  if (!SENTRY_DSN) return
  Sentry.setUser(user)
}
