// Simple privacy-friendly analytics
// Only tracks essential metrics, no personal data

const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT || null
const ENABLE_ANALYTICS = import.meta.env.PROD && ANALYTICS_ENDPOINT

// Queue for offline tracking
let eventQueue = []
const QUEUE_KEY = 'lofi-analytics-queue'

// Load queued events from localStorage
try {
  const saved = localStorage.getItem(QUEUE_KEY)
  if (saved) {
    eventQueue = JSON.parse(saved)
  }
} catch {
  eventQueue = []
}

// Save queue to localStorage
function saveQueue() {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(eventQueue.slice(-50)))
  } catch {
    // localStorage might be full
  }
}

// Send events to endpoint
async function sendEvents(events) {
  if (!ANALYTICS_ENDPOINT) return
  
  try {
    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true
    })
  } catch {
    // Silent fail - will retry later
  }
}

// Process and send queued events
async function flushQueue() {
  if (eventQueue.length === 0 || !navigator.onLine) return
  
  const events = [...eventQueue]
  eventQueue = []
  saveQueue()
  
  await sendEvents(events)
}

// Track an event
export function track(eventName, properties = {}) {
  if (!ENABLE_ANALYTICS) return
  
  const event = {
    name: eventName,
    properties: {
      ...properties,
      // Add some context
      url: window.location.pathname,
      referrer: document.referrer || null
    },
    timestamp: Date.now(),
    sessionId: getSessionId()
  }
  
  eventQueue.push(event)
  saveQueue()
  
  // Try to send immediately if online
  if (navigator.onLine && eventQueue.length >= 5) {
    flushQueue()
  }
}

// Track performance metrics
export function trackPerformance(metricName, value) {
  track('performance', { metric: metricName, value })
}

// Get or create session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('lofi-session-id')
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem('lofi-session-id', sessionId)
  }
  return sessionId
}

// Flush queue on page unload
window.addEventListener('beforeunload', () => {
  if (eventQueue.length > 0) {
    flushQueue()
  }
})

// Flush queue when coming back online
window.addEventListener('online', flushQueue)

// Initialize
export function initAnalytics() {
  if (!ENABLE_ANALYTICS) return
  
  // Track page load
  window.addEventListener('load', () => {
    const timing = performance.timing
    track('page_load', {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart
    })
  })
  
  // Track Core Web Vitals (simplified)
  if ('web-vitals' in window) {
    // Would use web-vitals library in production
  }
  
  // Flush any queued events
  flushQueue()
}
